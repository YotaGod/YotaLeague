// 🔑 GANTI DENGAN KREDENSIAL SUPABASE KAMU
const SUPABASE_URL = "SUPABASE_URL_HIDDEN";
const SUPABASE_ANON_KEY = "SUPABASE_ANON_KEY_HIDDEN";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State lokal
let state = {
  userId: null,
  turnamenId: null,
  nama: "",
  sistem: "single",
  players: [],
  matches: [],
  logs: [],
};

// DOM Elements
const setupSection = document.getElementById("setup-section");
const bracketSection = document.getElementById("bracket-section");
const setupForm = document.getElementById("setup-form");
const playersInputs = document.getElementById("players-inputs");
const bracketTitle = document.getElementById("bracket-title");
const bracketContainer = document.getElementById("bracket-container");
const logList = document.getElementById("log-list");
const scoreModal = document.getElementById("score-modal");
const btnKembali = document.getElementById("btn-kembali");
const roundRobinOptions = document.getElementById("round-robin-options");
let currentMatchId = null;

// Init
document.addEventListener("DOMContentLoaded", async () => {
  if (btnKembali) {
    btnKembali.addEventListener("click", async () => {
      if (confirm("Hapus SEMUA data dari database? Tindakan ini TIDAK BISA dikembalikan!")) {
        try {
          await db.from("log_activity").delete().not("timestamp", "is", null);
          await db.from("state_turnamen").delete().not("turnamen_id", "is", null);
          await db.from("tim").delete().not("turnamen_id", "is", null);
          await db.from("turnamen").delete().not("nama", "is", null);

          state = { turnamenId: null, nama: "", sistem: "single", rrType: null, players: [], matches: [], logs: [], standings: [] };
          render();
          setupSection.classList.remove("hidden");
          bracketSection.classList.add("hidden");
          document.getElementById("setup-form").reset();
          playersInputs.innerHTML = "";
          alert("✅ SEMUA data berhasil dihapus! Siap untuk turnamen baru.");
        } catch (error) {
          alert("Error menghapus data: " + error.message);
          console.error(error);
        }
      }
    });
  }

  // 1. Inisialisasi Anonymous Sign-In
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    const { data, error } = await db.auth.signInAnonymously();
    if (error) {
      console.error("Gagal login anonim:", error);
    } else {
      state.userId = data.user?.id;
      console.log("Logged in anonymously:", state.userId);
    }
  } else {
    state.userId = session.user.id;
    console.log("Session restored:", state.userId);
  }

  await checkExistingTournament();
  render();
});

// Tampilkan opsi Round Robin hanya jika mode round_robin dipilih
document.querySelectorAll('input[name="tournament-mode"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    if (e.target.value === "round_robin") {
      roundRobinOptions.classList.remove("hidden");
    } else {
      roundRobinOptions.classList.add("hidden");
    }
  });
});

// ✅ GANTI fungsi player-count yang lama dengan ini:
document.getElementById("player-count").addEventListener("input", (e) => {
  const count = parseInt(e.target.value);
  const selectedMode = document.querySelector(
    'input[name="tournament-mode"]:checked',
  ).value;

  // Single & Double harus genap
  if (
    (selectedMode === "single" || selectedMode === "double") &&
    (count % 2 !== 0 || count < 2)
  ) {
    playersInputs.innerHTML =
      '<p style="color: var(--danger); font-size: 0.9em;">⚠️ Jumlah pemain harus genap dan minimal 2 untuk mode ini.</p>';
    return;
  }

  // Round Robin bisa ganjil
  if (selectedMode === "round_robin" && count < 2) {
    playersInputs.innerHTML =
      '<p style="color: var(--danger); font-size: 0.9em;">⚠️ Minimal 2 pemain.</p>';
    return;
  }

  playersInputs.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const row = document.createElement("div");
    row.className = "player-row";
    row.innerHTML = `
      <div class="player-input-group">
        <label>Pemain ${i + 1}</label>
        <input type="text" class="p-name" placeholder="Nama Pemain" required>
      </div>
      <div class="player-input-group">
        <label>Tim ${i + 1}</label>
        <input type="text" class="t-name" placeholder="Nama Tim" required>
      </div>
    `;
    playersInputs.appendChild(row);
  }
});

// Submit Setup
setupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("tournament-name").value;
  const count = parseInt(document.getElementById("player-count").value);
  // ✅ TAMBAHKAN 2 BARIS INI DI BAWAH const count = ...
  const selectedMode = document.querySelector(
    'input[name="tournament-mode"]:checked',
  ).value;
  const rrType =
    selectedMode === "round_robin"
      ? document.querySelector('input[name="rr-type"]:checked').value
      : null;

  if (
    (selectedMode === "single" || selectedMode === "double") &&
    (count % 2 !== 0 || count < 2)
  ) {
    alert("Jumlah pemain harus genap dan minimal 2 untuk mode ini!");
    return;
  }

  if (selectedMode === "round_robin" && count < 2) {
    alert("Minimal 2 pemain!");
    return;
  }

  const rows = document.querySelectorAll(".player-row");
  const players = [];
  rows.forEach((r, idx) => {
    const p = r.querySelector(".p-name").value.trim();
    const t = r.querySelector(".t-name").value.trim();
    if (p && t) {
      players.push({
        id: crypto.randomUUID(),
        nama_pemain: p,
        nama_tim: t,
      });
    }
  });

  if (players.length !== count) {
    alert("Lengkapi semua data pemain!");
    return;
  }

  state.sistem = selectedMode;
  state.rrType = rrType;

  if (!state.userId) {
    alert("Gagal membuat turnamen: Sesi pengguna anonim belum aktif. Pastikan Anda sudah mengaktifkan 'Anonymous Sign-ins' di Supabase Dashboard -> Authentication -> Providers.");
    return;
  }

  try {
    // 1. Buat turnamen
    const { data: turnamen, error: errT } = await db
      .from("turnamen")
      .insert({ nama, sistem: state.sistem, user_id: state.userId })
      .select()
      .single();

    if (errT) throw errT;

    state.turnamenId = turnamen.id;
    state.nama = nama;
    state.players = players;

    // 2. Simpan tim
    const { error: errP } = await db.from("tim").insert(
      players.map((p) => ({
        id: p.id,
        nama_pemain: p.nama_pemain,
        nama_tim: p.nama_tim,
        turnamen_id: state.turnamenId,
        user_id: state.userId,
      })),
    );

    if (errP) throw errP;

    // 3. Generate bracket
    if (state.sistem === "round_robin") {
      generateRoundRobin();
    } else {
      generateBracket();
    }

    // 4. Simpan state
    await saveState();

    // 5. Render ulang
    render();
  } catch (error) {
    alert("Error: " + error.message);
    console.error(error);
  }
});

function generateBracket() {
  if (state.sistem === "single") {
    generateSingleElimination();
  } else if (state.sistem === "double") {
    // Sebagai permulaan, double eliminasi disederhanakan
    // Jika tidak 4 atau 8 pemain, kita beri alert.
    if (
      state.players.length !== 4 &&
      state.players.length !== 8 &&
      state.players.length !== 2
    ) {
      alert(
        "⚠️ Double Eliminasi saat ini paling stabil untuk 2, 4, atau 8 pemain. Akan dialihkan ke Single Eliminasi.",
      );
      state.sistem = "single";
      generateSingleElimination();
    } else {
      generateDoubleElimination();
    }
  }
}

function generateSingleElimination() {
  const shuffled = [...state.players].sort(() => 0.5 - Math.random());
  state.matches = [];

  let numPlayers = shuffled.length;
  let nextPowerOf2 = 1;
  while (nextPowerOf2 < numPlayers) nextPowerOf2 *= 2;

  let numByes = nextPowerOf2 - numPlayers;
  let totalRounds = Math.log2(nextPowerOf2);

  // Simpan node per ronde
  let matchesByRound = {};
  for (let r = 1; r <= totalRounds; r++) {
    matchesByRound[r] = [];
    let numMatches = Math.pow(2, totalRounds - r);
    for (let i = 0; i < numMatches; i++) {
      matchesByRound[r].push({
        id: crypto.randomUUID(),
        round: r,
        matchIndex: i,
        playerA: null,
        playerB: null,
        scoreA: null,
        scoreB: null,
        winner: null,
        winnerId: null,
        status: r === 1 ? "pending" : "waiting",
        isBye: false,
        nextMatchId: null,
        nextSlot: null, // 'A' atau 'B'
        isLoserBracket: false,
      });
    }
  }

  // Hubungkan match ke nextMatch
  for (let r = 1; r < totalRounds; r++) {
    for (let i = 0; i < matchesByRound[r].length; i++) {
      let nextMatchIndex = Math.floor(i / 2);
      matchesByRound[r][i].nextMatchId =
        matchesByRound[r + 1][nextMatchIndex].id;
      matchesByRound[r][i].nextSlot = i % 2 === 0 ? "A" : "B";
    }
  }

  // Masukkan pemain ke Ronde 1
  let playerIdx = 0;
  for (let i = 0; i < matchesByRound[1].length; i++) {
    let m = matchesByRound[1][i];
    m.playerA = shuffled[playerIdx++];

    // BYE diletakkan di akhir
    if (i >= matchesByRound[1].length - numByes) {
      m.playerB = { id: "bye", nama_tim: "(BYE)", nama_pemain: "BYE" };
      m.isBye = true;
      m.status = "completed";
      m.scoreA = 1;
      m.scoreB = 0;
      m.winner = m.playerA;
      m.winnerId = m.playerA.id;
    } else {
      m.playerB = shuffled[playerIdx++];
    }
  }

  for (let r = 1; r <= totalRounds; r++) {
    state.matches.push(...matchesByRound[r]);
  }

  // Langsung majukan yang dapat BYE
  state.matches
    .filter((m) => m.isBye)
    .forEach((m) => {
      advanceWinner(m);
    });
}

function generateDoubleElimination() {
  // Implementasi sederhana untuk 2, 4 atau 8 pemain
  const shuffled = [...state.players].sort(() => 0.5 - Math.random());
  state.matches = [];
  let numPlayers = shuffled.length;

  if (numPlayers === 2) {
    // Sama saja dengan single
    generateSingleElimination();
    return;
  }

  // Kumpulkan fungsi helper untuk buat match
  const createMatch = (round, roundName, isLB = false) => ({
    id: crypto.randomUUID(),
    round: round,
    roundName: roundName,
    matchIndex: state.matches.length,
    playerA: null,
    playerB: null,
    scoreA: null,
    scoreB: null,
    winner: null,
    winnerId: null,
    status: "waiting",
    nextMatchId: null,
    nextSlot: null,
    nextLoserMatchId: null,
    nextLoserSlot: null,
    isLoserBracket: isLB,
    isGrandFinal: roundName.includes("Grand Final"),
  });

  if (numPlayers === 4) {
    let m1 = createMatch(1, "Upper Bracket Semi Final");
    m1.status = "pending";
    let m2 = createMatch(1, "Upper Bracket Semi Final");
    m2.status = "pending";
    let m3 = createMatch(1, "Lower Bracket Ronde 1", true); // LB
    let m4 = createMatch(2, "Upper Bracket Final");
    let m5 = createMatch(2, "Lower Bracket Final", true);
    let m6 = createMatch(3, "Grand Final");

    // Pasangkan pemain
    m1.playerA = shuffled[0];
    m1.playerB = shuffled[1];
    m2.playerA = shuffled[2];
    m2.playerB = shuffled[3];

    // Hubungkan
    m1.nextMatchId = m4.id;
    m1.nextSlot = "A";
    m2.nextMatchId = m4.id;
    m2.nextSlot = "B";
    m1.nextLoserMatchId = m3.id;
    m1.nextLoserSlot = "A";
    m2.nextLoserMatchId = m3.id;
    m2.nextLoserSlot = "B";

    m3.nextMatchId = m5.id;
    m3.nextSlot = "A";
    m4.nextMatchId = m6.id;
    m4.nextSlot = "A";
    m4.nextLoserMatchId = m5.id;
    m4.nextLoserSlot = "B";

    m5.nextMatchId = m6.id;
    m5.nextSlot = "B";

    state.matches.push(m1, m2, m3, m4, m5, m6);
  } else if (numPlayers === 8) {
    let m1 = createMatch(1, "Upper Bracket Quarter Final");
    m1.status = "pending";
    m1.playerA = shuffled[0];
    m1.playerB = shuffled[1];
    let m2 = createMatch(1, "Upper Bracket Quarter Final");
    m2.status = "pending";
    m2.playerA = shuffled[2];
    m2.playerB = shuffled[3];
    let m3 = createMatch(1, "Upper Bracket Quarter Final");
    m3.status = "pending";
    m3.playerA = shuffled[4];
    m3.playerB = shuffled[5];
    let m4 = createMatch(1, "Upper Bracket Quarter Final");
    m4.status = "pending";
    m4.playerA = shuffled[6];
    m4.playerB = shuffled[7];

    let m5 = createMatch(1, "Lower Bracket Ronde 1", true);
    let m6 = createMatch(1, "Lower Bracket Ronde 1", true);

    let m7 = createMatch(2, "Upper Bracket Semi Final");
    let m8 = createMatch(2, "Upper Bracket Semi Final");

    let m9 = createMatch(2, "Lower Bracket Ronde 2", true);
    let m10 = createMatch(2, "Lower Bracket Ronde 2", true);

    let m11 = createMatch(3, "Lower Bracket Semi Final", true);

    let m12 = createMatch(3, "Lower Bracket Final");

    let m13 = createMatch(4, "Lower Bracket Final", true);

    let m14 = createMatch(4, "Grand Final");

    // WB R1 -> WB R2 & LB R1
    m1.nextMatchId = m7.id;
    m1.nextSlot = "A";
    m1.nextLoserMatchId = m5.id;
    m1.nextLoserSlot = "A";
    m2.nextMatchId = m7.id;
    m2.nextSlot = "B";
    m2.nextLoserMatchId = m5.id;
    m2.nextLoserSlot = "B";
    m3.nextMatchId = m8.id;
    m3.nextSlot = "A";
    m3.nextLoserMatchId = m6.id;
    m3.nextLoserSlot = "A";
    m4.nextMatchId = m8.id;
    m4.nextSlot = "B";
    m4.nextLoserMatchId = m6.id;
    m4.nextLoserSlot = "B";

    // LB R1 -> LB R2
    m5.nextMatchId = m9.id;
    m5.nextSlot = "A";
    m6.nextMatchId = m10.id;
    m6.nextSlot = "A";

    // WB R2 -> WB F & LB R2
    m7.nextMatchId = m12.id;
    m7.nextSlot = "A";
    m7.nextLoserMatchId = m9.id;
    m7.nextLoserSlot = "B";
    m8.nextMatchId = m12.id;
    m8.nextSlot = "B";
    m8.nextLoserMatchId = m10.id;
    m8.nextLoserSlot = "B";

    // LB R2 -> LB SF
    m9.nextMatchId = m11.id;
    m9.nextSlot = "A";
    m10.nextMatchId = m11.id;
    m10.nextSlot = "B";

    // LB SF -> LB F
    m11.nextMatchId = m13.id;
    m11.nextSlot = "A";

    // WB F -> GF & LB F
    m12.nextMatchId = m14.id;
    m12.nextSlot = "A";
    m12.nextLoserMatchId = m13.id;
    m12.nextLoserSlot = "B";

    // LB F -> GF
    m13.nextMatchId = m14.id;
    m13.nextSlot = "B";

    state.matches.push(
      m1,
      m2,
      m3,
      m4,
      m5,
      m6,
      m7,
      m8,
      m9,
      m10,
      m11,
      m12,
      m13,
      m14,
    );
  }
}

function generateRoundRobin() {
  const players = [...state.players];
  const isDouble = state.rrType === "double";
  state.matches = [];

  // Generate semua pasangan untuk Leg 1
  let leg1Matches = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      leg1Matches.push({
        playerA: players[i],
        playerB: players[j],
        playerAId: players[i].id,
        playerBId: players[j].id,
        leg: 1,
      });
    }
  }

  // Acak Leg 1 dengan smart shuffle
  leg1Matches = smartShuffle(leg1Matches, players);

  // Tambahkan Leg 1 ke state.matches
  leg1Matches.forEach((m, idx) => {
    state.matches.push({
      id: crypto.randomUUID(),
      round: 1,
      matchIndex: idx,
      playerA: m.playerA,
      playerB: m.playerB,
      scoreA: null,
      scoreB: null,
      winner: null,
      winnerId: null,
      status: "pending",
      isDraw: false,
      leg: 1,
    });
  });

  // Jika Double Round Robin, generate Leg 2 (tapi status waiting)
  if (isDouble) {
    let leg2Matches = [];
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        // Reverse home-away untuk Leg 2
        leg2Matches.push({
          playerA: players[j],
          playerB: players[i],
          playerAId: players[j].id,
          playerBId: players[i].id,
          leg: 2,
        });
      }
    }

    // Acak Leg 2
    leg2Matches = smartShuffle(leg2Matches, players);

    // Tambahkan Leg 2 dengan status 'waiting'
    leg2Matches.forEach((m, idx) => {
      state.matches.push({
        id: crypto.randomUUID(),
        round: 2,
        matchIndex: idx,
        playerA: m.playerA,
        playerB: m.playerB,
        scoreA: null,
        scoreB: null,
        winner: null,
        winnerId: null,
        status: "waiting", // ⚠️ Status waiting sampai Leg 1 selesai
        isDraw: false,
        leg: 2,
      });
    });
  }

  // Inisialisasi standings
  state.standings = players.map((p) => ({
    id: p.id,
    nama_tim: p.nama_tim,
    nama_pemain: p.nama_pemain,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
  }));
}

// ✅ TAMBAHKAN fungsi smartShuffle ini:
function smartShuffle(matches, players) {
  const shuffled = [];
  const remaining = [...matches];
  const playerLastMatchIndex = {};

  // Inisialisasi
  players.forEach((p) => {
    playerLastMatchIndex[p.id] = -3; // Set awal agar bisa main di match pertama
  });

  let attempts = 0;
  const maxAttempts = remaining.length * remaining.length * 10;

  while (remaining.length > 0 && attempts < maxAttempts) {
    attempts++;
    let found = false;

    // Acak urutan remaining
    remaining.sort(() => 0.5 - Math.random());

    for (let i = 0; i < remaining.length; i++) {
      const match = remaining[i];
      const lastA = playerLastMatchIndex[match.playerAId] || -3;
      const lastB = playerLastMatchIndex[match.playerBId] || -3;
      const currentIndex = shuffled.length;

      // Cek apakah salah satu pemain baru saja bermain (dalam 2 match terakhir)
      if (currentIndex - lastA < 2 || currentIndex - lastB < 2) {
        continue; // Skip match ini, coba yang lain
      }

      // Match ini aman untuk ditambahkan
      shuffled.push(match);
      remaining.splice(i, 1);

      // Update last match index
      playerLastMatchIndex[match.playerAId] = currentIndex;
      playerLastMatchIndex[match.playerBId] = currentIndex;

      found = true;
      break;
    }

    // Jika tidak ada match yang bisa ditambahkan (deadlock), paksa ambil yang pertama
    if (!found && remaining.length > 0) {
      const match = remaining[0];
      shuffled.push(match);
      remaining.splice(0, 1);

      playerLastMatchIndex[match.playerAId] = shuffled.length - 1;
      playerLastMatchIndex[match.playerBId] = shuffled.length - 1;
    }
  }

  return shuffled;
}

// Advance winner ke ronde berikutnya
function advanceWinner(completedMatch) {
  // 1. Advance Winner
  if (completedMatch.nextMatchId) {
    let nextMatch = state.matches.find(
      (m) => m.id === completedMatch.nextMatchId,
    );
    if (nextMatch) {
      if (completedMatch.nextSlot === "A") {
        nextMatch.playerA = completedMatch.winner;
        nextMatch.winnerIdA = completedMatch.winnerId;
      } else {
        nextMatch.playerB = completedMatch.winner;
        nextMatch.winnerIdB = completedMatch.winnerId;
      }

      if (nextMatch.playerA && nextMatch.playerB && !nextMatch.isBye) {
        nextMatch.status = "pending";
      }
    }
  }

  // 2. Advance Loser (khusus Double Elimination)
  if (completedMatch.nextLoserMatchId) {
    let loser =
      completedMatch.winnerId === completedMatch.playerA.id
        ? completedMatch.playerB
        : completedMatch.playerA;
    let nextLoserMatch = state.matches.find(
      (m) => m.id === completedMatch.nextLoserMatchId,
    );
    if (nextLoserMatch && loser) {
      if (completedMatch.nextLoserSlot === "A") {
        nextLoserMatch.playerA = loser;
      } else {
        nextLoserMatch.playerB = loser;
      }

      if (nextLoserMatch.playerA && nextLoserMatch.playerB) {
        nextLoserMatch.status = "pending";
      }
    }
  }
}

// Render UI
// ✅ GANTI fungsi render() dengan ini:

function render() {
  if (state.matches.length > 0) {
    setupSection.classList.add("hidden");
    bracketSection.classList.remove("hidden");

    // Tampilkan mode yang benar
    let modeText = state.sistem.toUpperCase();
    if (state.sistem === "round_robin") {
      modeText += ` (${state.rrType === "double" ? "DOUBLE" : "SINGLE"})`;
    }
    bracketTitle.textContent = `🏟️ ${state.nama} (${modeText})`;



    bracketContainer.innerHTML = "";

    // ✅ Jika Round Robin, tampilkan klasemen + jadwal
    if (state.sistem === "round_robin") {
      renderRoundRobin();
    } else {
      // Render bracket untuk single/double elimination
      renderEliminationBracket();
    }

    // Render Blacklist
    renderBlacklist();
  }
}

function renderBlacklist() {
  const container = document.getElementById("blacklist-container");
  const list = document.getElementById("blacklist-list");
  
  if (!container || !list) return;

  const bannedData = {};

  state.matches.forEach(m => {
    if (m.redCardsA && m.redCardsA.length > 0) {
      if (!bannedData[m.playerA.id]) bannedData[m.playerA.id] = { team: m.playerA.nama_tim, owner: m.playerA.nama_pemain, banned: new Set() };
      m.redCardsA.forEach(p => bannedData[m.playerA.id].banned.add(p));
    }
    if (m.redCardsB && m.redCardsB.length > 0) {
      if (!bannedData[m.playerB.id]) bannedData[m.playerB.id] = { team: m.playerB.nama_tim, owner: m.playerB.nama_pemain, banned: new Set() };
      m.redCardsB.forEach(p => bannedData[m.playerB.id].banned.add(p));
    }
  });

  const bannedTeams = Object.values(bannedData);

  if (bannedTeams.length === 0) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  list.innerHTML = bannedTeams.map(t => `
    <div class="blacklist-card">
      <div class="team-owner">${t.team} (${t.owner})</div>
      <div class="banned-players">
        ${Array.from(t.banned).map(p => `<div><span>${p}</span><span class="banned-badge">BANNED</span></div>`).join('')}
      </div>
    </div>
  `).join("");
}

// ✅ FUNGSI BARU: Render Round Robin
function renderRoundRobin() {
  // 1. Tampilkan klasemen
  const standingsDiv = document.createElement("div");
  standingsDiv.className = "round";
  standingsDiv.style.width = "100%";
  standingsDiv.style.marginBottom = "20px";

  let standingsHTML = "<h4>📊 Klasemen</h4>";
  standingsHTML += '<div class="standings-table">';
  standingsHTML += '<div class="standings-header">';
  standingsHTML += "<span>Tim</span>";
  standingsHTML += "<span>Main</span>";
  standingsHTML += "<span>M</span>";
  standingsHTML += "<span>S</span>";
  standingsHTML += "<span>K</span>";
  standingsHTML += "<span>MG</span>";
  standingsHTML += "<span>GD</span>";
  standingsHTML += "<span>Poin</span>";
  standingsHTML += "</div>";

  // Sort standings: poin > goal difference
  const sortedStandings = [...state.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.gd - a.gd;
  });

  sortedStandings.forEach((s, idx) => {
    standingsHTML += '<div class="standings-row">';
    standingsHTML += `<span class="pos-${idx + 1}">${idx + 1}. ${s.nama_tim}</span>`;
    standingsHTML += `<span>${s.played}</span>`;
    standingsHTML += `<span>${s.won}</span>`;
    standingsHTML += `<span>${s.drawn}</span>`;
    standingsHTML += `<span>${s.lost}</span>`;
    standingsHTML += `<span>${s.gf}-${s.ga}</span>`;
    standingsHTML += `<span>${s.gd >= 0 ? "+" : ""}${s.gd}</span>`;
    standingsHTML += `<span class="points">${s.points}</span>`;
    standingsHTML += "</div>";
  });

  standingsHTML += "</div>";
  standingsDiv.innerHTML = standingsHTML;
  bracketContainer.appendChild(standingsDiv);

  // 2. Tampilkan jadwal pertandingan
  const matchesDiv = document.createElement("div");
  matchesDiv.className = "round";
  matchesDiv.style.width = "100%";
  matchesDiv.innerHTML = "<h4>⚽ Jadwal Pertandingan</h4>";

  const pendingMatches = state.matches.filter((m) => m.status === "pending");
  const completedMatches = state.matches.filter(
    (m) => m.status === "completed",
  );
  const waitingMatches = state.matches.filter((m) => m.status === "waiting");

  // Cek apakah Leg 2 sudah dimulai
  const leg2Started = state.matches.some(
    (m) => m.leg === 2 && m.status !== "waiting",
  );

  // Jika Leg 2 sudah dimulai, filter untuk hanya tampilkan Leg 2 saja
  let displayMatches = pendingMatches;
  if (leg2Started) {
    displayMatches = pendingMatches.filter((m) => m.leg === 2);
  }

  // Tampilkan tombol "Mulai Leg 2" jika ada waiting matches
  if (
    waitingMatches.length > 0 &&
    pendingMatches.filter((m) => m.leg === 1).length === 0
  ) {
    const leg1Complete = state.matches
      .filter((m) => m.leg === 1)
      .every((m) => m.status === "completed");
    if (leg1Complete) {
      const startLeg2Btn = document.createElement("div");
      startLeg2Btn.style.width = "100%";
      startLeg2Btn.style.marginBottom = "20px";
      startLeg2Btn.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%); border: 2px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 20px; text-align: center;">
          <h4 style="color: var(--success); margin-bottom: 12px;">✅ Leg 1 Selesai! Siap untuk Leg 2</h4>
          <button id="btn-start-leg2" style="background: var(--success); border: none; color: white; padding: 12px 30px; font-size: 1.05em; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
            🚀 Mulai Leg 2
          </button>
        </div>
      `;
      matchesDiv.appendChild(startLeg2Btn);

      // Tambahkan event listener untuk tombol
      setTimeout(() => {
        const btn = document.getElementById("btn-start-leg2");
        if (btn) {
          btn.onclick = async () => {
            waitingMatches.forEach((m) => {
              m.status = "pending";
            });
            await saveState();
            render();
          };
          btn.addEventListener("mouseenter", function () {
            this.style.opacity = "0.9";
            this.style.transform = "translateY(-2px)";
          });
          btn.addEventListener("mouseleave", function () {
            this.style.opacity = "1";
            this.style.transform = "translateY(0)";
          });
        }
      }, 0);
    }
  }

  // Tampilkan yang belum dimainkan
  if (displayMatches.length > 0) {
    displayMatches.forEach((m) => {
      const matchDiv = document.createElement("div");
      matchDiv.className = `match pending ${m.leg === 2 ? "leg2-match" : ""}`;

      let matchHTML = "";

      matchHTML += `<div class="match-teams-header">`;
      matchHTML += `  <div class="team-name">${m.playerA.nama_tim}</div>`;
      matchHTML += `  <div class="vs-badge">VS</div>`;
      matchHTML += `  <div class="team-name">${m.playerB.nama_tim}</div>`;
      matchHTML += `</div>`;

      matchHTML += `<div class="match-body">`;
      if (m.leg === 2) {
        const leg1Match = state.matches.find(
          (match) =>
            match.leg === 1 &&
            ((match.playerA.id === m.playerA.id &&
              match.playerB.id === m.playerB.id) ||
              (match.playerA.id === m.playerB.id &&
                match.playerB.id === m.playerA.id)) &&
            match.status === "completed",
        );

        if (leg1Match) {
          let scoreA =
            leg1Match.playerA.id === m.playerA.id
              ? leg1Match.scoreA
              : leg1Match.scoreB;
          let scoreB =
            leg1Match.playerA.id === m.playerA.id
              ? leg1Match.scoreB
              : leg1Match.scoreA;
          matchHTML += `<div class="leg-info">Leg 1: ${scoreA} - ${scoreB}</div>`;
        }
      }

      matchHTML += `<div class="leg-label">Leg ${m.leg} (Pending)</div>`;
      matchHTML += `<div class="main-score">- : -</div>`;
      matchHTML += `</div>`;

      matchHTML += `<small class="click-hint">Klik untuk input skor Leg ${m.leg}</small>`;

      matchDiv.innerHTML = matchHTML;
      matchDiv.onclick = () => openScoreModal(m.id);
      matchesDiv.appendChild(matchDiv);
    });
  }

  // Tampilkan yang sudah dimainkan (hanya Leg 2 jika sudah dimulai)
  let displayCompletedMatches = completedMatches;
  if (leg2Started) {
    displayCompletedMatches = completedMatches.filter((m) => m.leg === 2);
  }

  if (displayCompletedMatches.length > 0) {
    displayCompletedMatches.forEach((m) => {
      const matchDiv = document.createElement("div");
      matchDiv.className = `match completed ${m.leg === 2 ? "leg2-match" : ""}`;

      let matchHTML = "";

      let aggScoreA = m.scoreA;
      let aggScoreB = m.scoreB;
      let hasLeg1 = false;
      let leg1Str = "";

      if (m.leg === 2) {
        const leg1Match = state.matches.find(
          (match) =>
            match.leg === 1 &&
            ((match.playerA.id === m.playerA.id &&
              match.playerB.id === m.playerB.id) ||
              (match.playerA.id === m.playerB.id &&
                match.playerB.id === m.playerA.id)) &&
            match.status === "completed",
        );

        if (leg1Match) {
          hasLeg1 = true;
          let scoreA =
            leg1Match.playerA.id === m.playerA.id
              ? leg1Match.scoreA
              : leg1Match.scoreB;
          let scoreB =
            leg1Match.playerA.id === m.playerA.id
              ? leg1Match.scoreB
              : leg1Match.scoreA;

          leg1Str = `Leg 1: ${scoreA} - ${scoreB}`;
          aggScoreA += scoreA;
          aggScoreB += scoreB;
        }
      }

      const winnerA = aggScoreA > aggScoreB;
      const winnerB = aggScoreB > aggScoreA;

      matchHTML += `<div class="match-teams-header">`;
      matchHTML += `  <div class="team-name ${winnerA ? "winner" : ""}">${m.playerA.nama_tim}</div>`;
      matchHTML += `  <div class="vs-badge">VS</div>`;
      matchHTML += `  <div class="team-name ${winnerB ? "winner" : ""}">${m.playerB.nama_tim}</div>`;
      matchHTML += `</div>`;

      matchHTML += `<div class="match-body">`;
      if (hasLeg1) {
        matchHTML += `<div class="leg-info">${leg1Str} | Leg 2: ${m.scoreA} - ${m.scoreB}</div>`;
        matchHTML += `<div class="leg-label">Agg (Selesai)</div>`;
      } else {
        matchHTML += `<div class="leg-label">Leg 1 (Selesai)</div>`;
      }

      matchHTML += `<div class="main-score">${aggScoreA} : ${aggScoreB}</div>`;
      matchHTML += `</div>`;
      matchHTML += `<small class="click-hint">Klik untuk bagikan hasil (Poster)</small>`;

      matchDiv.innerHTML = matchHTML;
      matchDiv.onclick = () => openShareModal(m.id);
      matchesDiv.appendChild(matchDiv);
    });
  }

  bracketContainer.appendChild(matchesDiv);
}

// ✅ FUNGSI BARU: Render Elimination Bracket (pindah dari render())
function renderEliminationBracket() {
  const maxRound = Math.max(...state.matches.map((m) => m.round));

  // Pisahkan WB dan LB
  const wbMatches = state.matches.filter((m) => !m.isLoserBracket);
  const lbMatches = state.matches.filter((m) => m.isLoserBracket);

  const renderGroup = (matches, titlePrefix) => {
    if (matches.length === 0) return;

    // Group by round
    const rounds = {};
    matches.forEach((m) => {
      if (!rounds[m.round]) rounds[m.round] = [];
      rounds[m.round].push(m);
    });

    const groupDiv = document.createElement("div");
    groupDiv.style.display = "flex";
    groupDiv.style.flexDirection = "column";
    groupDiv.style.gap = "20px";
    groupDiv.style.width = "100%";
    groupDiv.style.marginBottom = "30px";

    if (lbMatches.length > 0) {
      const header = document.createElement("h3");
      header.textContent = titlePrefix;
      header.style.textAlign = "center";
      header.style.color = "var(--accent)";
      header.style.width = "100%";
      groupDiv.appendChild(header);
    }

    const flexContainer = document.createElement("div");
    flexContainer.style.display = "flex";
    flexContainer.style.gap = "15px";
    flexContainer.style.justifyContent = "center";
    flexContainer.style.flexWrap = "wrap";

    Object.keys(rounds)
      .sort((a, b) => a - b)
      .forEach((r) => {
        const roundDiv = document.createElement("div");
        roundDiv.className = "round";

        // Gunakan roundName jika ada (untuk double elim), jika tidak gunakan Ronde X
        const sampleMatch = rounds[r][0];
        const roundName =
          sampleMatch.roundName || (r == maxRound ? "Final" : `Ronde ${r}`);

        roundDiv.innerHTML = `<h4>${roundName}</h4>`;

        rounds[r].forEach((m) => {
          // Jangan tampilkan BYE di UI secara eksplisit agar lebih rapi, kecuali jika belum selesai
          if (m.isBye && state.sistem === "single") return;

          const matchDiv = document.createElement("div");
          matchDiv.className = `match ${m.status} ${m.winner ? "completed" : ""}`;

          const playerAName = m.playerA ? m.playerA.nama_tim : "TBD";
          const playerBName = m.playerB ? m.playerB.nama_tim : "TBD";
          const scoreA = m.scoreA !== null ? m.scoreA : "-";
          const scoreB = m.scoreB !== null ? m.scoreB : "-";

          const winnerA =
            m.winnerId && m.winnerId === m.playerA?.id ? "winner" : "";
          const winnerB =
            m.winnerId && m.winnerId === m.playerB?.id ? "winner" : "";

          matchDiv.innerHTML = `
          <div class="match-teams-header">
            <div class="team-name ${winnerA}">${playerAName}</div>
            <div class="vs-badge">VS</div>
            <div class="team-name ${winnerB}">${playerBName}</div>
          </div>
          <div class="match-body">
            <div class="main-score">${scoreA} : ${scoreB}</div>
          </div>
          ${m.status === "pending" ? '<small class="click-hint">Klik untuk input skor</small>' : ""}
          ${m.status === "waiting" ? '<small class="waiting">Menunggu...</small>' : ""}
        `;

          if (m.status === "pending") {
            matchDiv.onclick = () => openScoreModal(m.id);
          } else if (m.status === "completed") {
            matchDiv.innerHTML += '<small class="click-hint" style="margin-top: 5px;">Klik untuk bagikan hasil (Poster)</small>';
            matchDiv.onclick = () => openShareModal(m.id);
          }

          roundDiv.appendChild(matchDiv);
        });

        if (roundDiv.children.length > 1) {
          // Lebih dari sekedar <h4>
          flexContainer.appendChild(roundDiv);
        }
      });

    groupDiv.appendChild(flexContainer);
    bracketContainer.appendChild(groupDiv);
  };

  renderGroup(wbMatches, "🏆 Upper Bracket");
  renderGroup(lbMatches, "🥊 Lower Bracket");
}

// Modal Skor
function openScoreModal(matchId) {
  currentMatchId = matchId;
  const m = state.matches.find((x) => x.id === matchId);

  if (!m) {
    alert("Pertandingan tidak tersedia!");
    return;
  }

  const isEdit = m.status === "completed";

  // Tampilkan info leg dan hasil leg sebelumnya jika ada
  let modalTitle = isEdit ? `Edit Skor Leg ${m.leg || ""}` : `Input Skor Leg ${m.leg || ""}`;
  let leg1Info = "";

  if (m.leg === 2) {
    // Cari hasil Leg 1
    const leg1Match = state.matches.find(
      (match) =>
        match.leg === 1 &&
        ((match.playerA.id === m.playerA.id &&
          match.playerB.id === m.playerB.id) ||
          (match.playerA.id === m.playerB.id &&
            match.playerB.id === m.playerA.id)) &&
        match.status === "completed",
    );

    if (leg1Match) {
      let scoreA =
        leg1Match.playerA.id === m.playerA.id
          ? leg1Match.scoreA
          : leg1Match.scoreB;
      let scoreB =
        leg1Match.playerA.id === m.playerA.id
          ? leg1Match.scoreB
          : leg1Match.scoreA;
      const teamAWon = scoreA > scoreB;
      const teamBWon = scoreB > scoreA;

      leg1Info = `
        <div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 6px; padding: 10px; margin: 10px 0; font-size: 0.85em;">
          <div style="font-size: 0.75em; font-weight: bold; color: var(--accent); margin-bottom: 6px; opacity: 0.9;">📊 HASIL LEG 1</div>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
            <span style="flex: 1; text-align: center; ${teamAWon ? "color: var(--success); font-weight: bold;" : ""}">${m.playerA.nama_tim}</span>
            <span style="font-weight: bold; color: var(--accent); margin: 0 8px;">${scoreA} - ${scoreB}</span>
            <span style="flex: 1; text-align: center; ${teamBWon ? "color: var(--success); font-weight: bold;" : ""}">${m.playerB.nama_tim}</span>
          </div>
        </div>
      `;
    }
  }

  document.getElementById("match-info").innerHTML =
    `<strong>${modalTitle}</strong><br><div class="match-teams-header" style="border:none; margin: 10px 0;"><div class="team-name">${m.playerA.nama_tim}</div><div class="vs-badge">VS</div><div class="team-name">${m.playerB.nama_tim}</div></div>${leg1Info}`;

  // Isi form dengan data sebelumnya jika mode edit
  document.getElementById("score-a").value = isEdit ? m.scoreA : "";
  document.getElementById("score-b").value = isEdit ? m.scoreB : "";
  const rcA = document.getElementById("redcard-a");
  const rcB = document.getElementById("redcard-b");
  if (rcA) rcA.value = (isEdit && m.redCardsA) ? m.redCardsA.join(", ") : "";
  if (rcB) rcB.value = (isEdit && m.redCardsB) ? m.redCardsB.join(", ") : "";
  
  const rcLabelA = document.getElementById("redcard-label-a");
  const rcLabelB = document.getElementById("redcard-label-b");
  if (rcLabelA) rcLabelA.textContent = `Tim ${m.playerA.nama_tim}`;
  if (rcLabelB) rcLabelB.textContent = `Tim ${m.playerB.nama_tim}`;
  scoreModal.classList.remove("hidden");
}

document.getElementById("close-modal").onclick = () => {
  scoreModal.classList.add("hidden");
  currentMatchId = null;
};

document.getElementById("confirm-score").onclick = async () => {
  const sA = parseInt(document.getElementById("score-a").value);
  const sB = parseInt(document.getElementById("score-b").value);

  if (isNaN(sA) || isNaN(sB)) {
    alert("Isi skor dengan angka!");
    return;
  }

  const m = state.matches.find((x) => x.id === currentMatchId);
  if (!m) return;

  // Validasi untuk eliminasi
  if (state.sistem !== "round_robin" && sA === sB) {
    alert("Tidak boleh seri di sistem gugur!");
    return;
  }

  const isEdit = m.status === "completed";
  const oldScoreA = m.scoreA;
  const oldScoreB = m.scoreB;
  const oldWinnerId = m.winnerId;

  m.scoreA = sA;
  m.scoreB = sB;
  m.status = "completed";

  // Simpan Kartu Merah
  const rcAInput = document.getElementById("redcard-a");
  const rcBInput = document.getElementById("redcard-b");
  if (rcAInput && rcAInput.value.trim() !== "") {
    m.redCardsA = rcAInput.value.split(",").map(s => s.trim()).filter(s => s.length > 0);
  } else {
    delete m.redCardsA;
  }
  if (rcBInput && rcBInput.value.trim() !== "") {
    m.redCardsB = rcBInput.value.split(",").map(s => s.trim()).filter(s => s.length > 0);
  } else {
    delete m.redCardsB;
  }

  // Update standings untuk Round Robin
  if (state.sistem === "round_robin") {
    if (isEdit) revertRoundRobinStandings(m, oldScoreA, oldScoreB);
    updateRoundRobinStandings(m);
    await saveStandings();
  } else {
    // Untuk eliminasi
    m.winner = sA > sB ? m.playerA : m.playerB;
    m.winnerId =
      sA > sB ? m.winnerIdA || m.playerA.id : m.winnerIdB || m.playerB.id;
      
    if (isEdit) {
      if (oldWinnerId !== m.winnerId) {
        resetDependentMatches(m);
        advanceWinner(m);
      }
    } else {
      advanceWinner(m);
    }
  }

  await saveState();

  scoreModal.classList.add("hidden");
  currentMatchId = null;
  render();

  // ✅ TAMBAHKAN INI: Cek apakah Leg 1 selesai dan aktifkan Leg 2
  if (state.sistem === "round_robin" && state.rrType === "double") {
    checkAndActivateLeg2();
  }

  checkTournamentComplete();
};

function checkTournamentComplete() {
  const finalMatch = state.matches.filter(
    (m) => m.round === Math.max(...state.matches.map((x) => x.round)),
  );
  if (finalMatch.every((m) => m.status === "completed")) {
    const champion = finalMatch[0].winner;
    setTimeout(() => {
      alert(`Pertandingan Selesai! Silahkan cek Klasemen.`);
    }, 500);
  }
}

// ✅ PASTIKAN fungsi ini ada:
function updateRoundRobinStandings(match) {
  const teamA = state.standings.find((s) => s.id === match.playerA.id);
  const teamB = state.standings.find((s) => s.id === match.playerB.id);

  if (!teamA || !teamB) return;

  // Update played
  teamA.played++;
  teamB.played++;

  // Update goals
  teamA.gf += match.scoreA;
  teamA.ga += match.scoreB;
  teamB.gf += match.scoreB;
  teamB.ga += match.scoreA;

  teamA.gd = teamA.gf - teamA.ga;
  teamB.gd = teamB.gf - teamB.ga;

  // Update win/draw/loss dan poin
  if (match.scoreA > match.scoreB) {
    teamA.won++;
    teamA.points += 3;
    teamB.lost++;
    match.winner = match.playerA;
    match.winnerId = match.playerA.id;
  } else if (match.scoreB > match.scoreA) {
    teamB.won++;
    teamB.points += 3;
    teamA.lost++;
    match.winner = match.playerB;
    match.winnerId = match.playerB.id;
  } else {
    // Seri
    teamA.drawn++;
    teamB.drawn++;
    teamA.points += 1;
    teamB.points += 1;
    match.isDraw = true;
  }
}

// ✅ Fungsi untuk mengembalikan statistik klasemen (Edit Score)
function revertRoundRobinStandings(match, oldScoreA, oldScoreB) {
  const teamA = state.standings.find((s) => s.id === match.playerA.id);
  const teamB = state.standings.find((s) => s.id === match.playerB.id);
  if (!teamA || !teamB) return;

  teamA.played--;
  teamB.played--;

  teamA.gf -= oldScoreA;
  teamA.ga -= oldScoreB;
  teamB.gf -= oldScoreB;
  teamB.ga -= oldScoreA;

  teamA.gd = teamA.gf - teamA.ga;
  teamB.gd = teamB.gf - teamB.ga;

  if (oldScoreA > oldScoreB) {
    teamA.won--;
    teamA.points -= 3;
    teamB.lost--;
  } else if (oldScoreB > oldScoreA) {
    teamB.won--;
    teamB.points -= 3;
    teamA.lost--;
  } else {
    teamA.drawn--;
    teamB.drawn--;
    teamA.points -= 1;
    teamB.points -= 1;
  }
}

// ✅ Fungsi untuk mereset pertandingan yang terdampak di eliminasi (Edit Score)
function resetDependentMatches(match) {
  if (match.nextMatchId) {
    let nextMatch = state.matches.find((m) => m.id === match.nextMatchId);
    if (nextMatch) {
      if (match.nextSlot === "A") {
        nextMatch.playerA = null;
        nextMatch.winnerIdA = null;
      } else {
        nextMatch.playerB = null;
        nextMatch.winnerIdB = null;
      }
      if (nextMatch.status === "completed") {
        nextMatch.status = "pending";
        nextMatch.scoreA = null;
        nextMatch.scoreB = null;
        nextMatch.winner = null;
        nextMatch.winnerId = null;
        resetDependentMatches(nextMatch);
      } else if (!nextMatch.playerA || !nextMatch.playerB) {
        nextMatch.status = "waiting";
      }
    }
  }

  if (match.nextLoserMatchId) {
    let nextLoserMatch = state.matches.find((m) => m.id === match.nextLoserMatchId);
    if (nextLoserMatch) {
      if (match.nextLoserSlot === "A") {
        nextLoserMatch.playerA = null;
      } else {
        nextLoserMatch.playerB = null;
      }
      if (nextLoserMatch.status === "completed") {
        nextLoserMatch.status = "pending";
        nextLoserMatch.scoreA = null;
        nextLoserMatch.scoreB = null;
        nextLoserMatch.winner = null;
        nextLoserMatch.winnerId = null;
        resetDependentMatches(nextLoserMatch);
      } else if (!nextLoserMatch.playerA || !nextLoserMatch.playerB) {
        nextLoserMatch.status = "waiting";
      }
    }
  }
}

// Persistence
async function saveStandings() {
  if (!state.turnamenId || state.sistem !== "round_robin") return;

  const { data: existing } = await db
    .from("state_turnamen")
    .select("id")
    .eq("turnamen_id", state.turnamenId)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (existing && existing.length > 0) {
    const { error } = await db
      .from("state_turnamen")
      .update({
        standings: state.standings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing[0].id);

    if (error) console.error("Error saving standings:", error);
  }
}

async function loadState(turnamenId) {
  const { data, error: stateError } = await db
    .from("state_turnamen")
    .select("*")
    .eq("turnamen_id", turnamenId)
    .order("updated_at", { ascending: false })
    .limit(1);

  const stateData = data && data.length > 0 ? data[0] : null;

  if (stateError || !stateData) return false;

  state.matches = stateData.data_pertandingan || [];

  // Load logs
  const { data: logs } = await db
    .from("log_activity")
    .select("*")
    .eq("turnamen_nama", state.nama)
    .order("timestamp", { ascending: false })
    .limit(50);

  state.logs = logs || [];

  return true;
}

// ✅ TAMBAHKAN fungsi ini setelah loadState()
async function loadStandings(turnamenId) {
  // Coba load dari database
  const { data } = await db
    .from("state_turnamen")
    .select("standings")
    .eq("turnamen_id", turnamenId)
    .order("updated_at", { ascending: false })
    .limit(1);
    
  const stateData = data && data.length > 0 ? data[0] : null;

  if (stateData && stateData.standings) {
    state.standings = stateData.standings;
  } else {
    // Jika belum ada, inisialisasi dari players
    state.standings = state.players.map((p) => ({
      id: p.id,
      nama_tim: p.nama_tim,
      nama_pemain: p.nama_pemain,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    }));
  }
}

async function checkExistingTournament() {
  if (!state.turnamenId) {
    // Cari turnamen terbaru yang aktif milik user ini
    const { data: turnamen, error: errT } = await db
      .from("turnamen")
      .select("*")
      .eq("user_id", state.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (errT || !turnamen) {
      return;
    }

    state.turnamenId = turnamen.id;
    state.nama = turnamen.nama;
    state.sistem = turnamen.sistem;
    state.rrType = turnamen.rr_type || null;

    // Load players
    const { data: players } = await db
      .from("tim")
      .select("*")
      .eq("turnamen_id", turnamen.id);

    state.players = players || [];

    // Load state pertandingan
    await loadState(turnamen.id);

    // Load standings untuk round robin
    if (state.sistem === "round_robin") {
      await loadStandings(turnamen.id);
    }
  }
}

// State Management

async function saveState() {
  if (!state.turnamenId) return;

  const payload = {
    data_pertandingan: state.matches,
    updated_at: new Date().toISOString(),
  };

  // Tambahkan standings jika round robin
  if (state.sistem === "round_robin" && state.standings) {
    payload.standings = state.standings;
  }

  // Cek apakah data sudah ada
  const { data: existing } = await db
    .from("state_turnamen")
    .select("id")
    .eq("turnamen_id", state.turnamenId)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (existing && existing.length > 0) {
    const { error } = await db.from("state_turnamen").update(payload).eq("id", existing[0].id);
    if (error) console.error("Error updating state:", error);
  } else {
    payload.turnamen_id = state.turnamenId;
    payload.user_id = state.userId;
    const { error } = await db.from("state_turnamen").insert(payload);
    if (error) console.error("Error inserting state:", error);
  }
}

// ✅ TAMBAHKAN fungsi ini
function checkAndActivateLeg2() {
  if (state.rrType !== "double") return;

  // Cek apakah semua Leg 1 sudah selesai
  const leg1Matches = state.matches.filter((m) => m.leg === 1);
  const leg2Matches = state.matches.filter((m) => m.leg === 2);

  const allLeg1Completed = leg1Matches.every((m) => m.status === "completed");
  const anyLeg2Pending = leg2Matches.some((m) => m.status === "pending");

  // Jika Leg 1 selesai dan ada Leg 2 yang sudah pending, jangan alert lagi
  if (allLeg1Completed && !anyLeg2Pending) {
    // Aktifkan semua Leg 2
    leg2Matches.forEach((m) => {
      if (m.status === "waiting") {
        m.status = "pending";
      }
    });
  }
}

// ==========================================
// CLUB ROULETTE FEATURE
// ==========================================

const btnRoulette = document.getElementById("btn-roulette");
const categoryModal = document.getElementById("roulette-category-modal");
const cameraModal = document.getElementById("roulette-camera-modal");
const closeCategoryModal = document.getElementById("close-category-modal");
const closeCameraModal = document.getElementById("close-camera-modal");
const rouletteVideo = document.getElementById("roulette-video");
const faceOverlaysContainer = document.getElementById("face-overlays-container");
const noFaceWarning = document.getElementById("no-face-warning");
const rouletteStatus = document.getElementById("roulette-status");
const btnStartGacha = document.getElementById("btn-start-gacha");

let rouletteClubs = [];
let selectedCategory = "";
let currentDetections = [];
let faceDetectionInterval = null;
let stream = null;

function clearRouletteTimers() {
  if (faceDetectionInterval) {
    clearInterval(faceDetectionInterval);
    faceDetectionInterval = null;
  }
}

// Buka modal kategori
if (btnRoulette) {
  btnRoulette.addEventListener("click", () => {
    categoryModal.classList.remove("hidden");
  });
}

// Tutup modal kategori
if (closeCategoryModal) {
  closeCategoryModal.addEventListener("click", () => {
    categoryModal.classList.add("hidden");
  });
}

// Pilih kategori
document.querySelectorAll(".category-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    selectedCategory = btn.dataset.category;
    categoryModal.classList.add("hidden");

    // Load clubs dari Supabase
    rouletteStatus.textContent = "Memuat klub...";
    await loadClubsForCategory(selectedCategory);

    if (rouletteClubs.length === 0) {
      alert(
        "Tidak ada Tim ditemukan untuk kategori ini. Tambahkan data di Supabase Dashboard.",
      );
      return;
    }

    // Buka modal kamera
    await openCameraModal();
  });
});

// Load clubs dari Supabase
async function loadClubsForCategory(category) {
  try {
    let query = db.from("club_roulette").select("*");

    if (category !== "All") {
      query = query.eq("kategori", category);
    }

    const { data, error } = await query;

    if (error) throw error;
    rouletteClubs = data || [];

    console.log(`Loaded ${rouletteClubs.length} clubs for ${category}`);
  } catch (error) {
    console.error("Error loading clubs:", error);
    rouletteClubs = [];
  }
}

// Buka modal kamera
async function openCameraModal() {
  clearRouletteTimers();

  cameraModal.classList.remove("hidden");
  faceOverlaysContainer.innerHTML = "";
  btnStartGacha.classList.add("hidden");
  noFaceWarning.classList.add("hidden");
  rouletteStatus.textContent = "Mengaktifkan kamera...";
  currentDetections = [];

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
    });
    rouletteVideo.srcObject = stream;

    // Load face-api.js models
    rouletteStatus.textContent = "Memuat model deteksi wajah...";
    await loadFaceApiModels();

    // Tunggu video play
    rouletteVideo.onplay = () => {
      startFaceDetection();
    };
  } catch (error) {
    console.error("Camera error:", error);
    rouletteStatus.textContent = "Gagal mengakses kamera. Pastikan izin kamera diberikan.";
    noFaceWarning.textContent = "❌ Gagal mengakses kamera. Periksa izin browser.";
    noFaceWarning.classList.remove("hidden");
  }
}

// Load face-api.js models dari CDN
async function loadFaceApiModels() {
  if (typeof faceapi === "undefined") {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model";
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    rouletteStatus.textContent = "Model siap. Tunjukkan wajah ke kamera!";
  } catch (error) {
    console.error("Model load error:", error);
    rouletteStatus.textContent = "Gagal memuat model. Coba refresh halaman.";
  }
}

// Mulai deteksi wajah
function startFaceDetection() {
  if (faceDetectionInterval) clearInterval(faceDetectionInterval);

  let frameCount = 0;
  faceDetectionInterval = setInterval(async () => {
    if (typeof faceapi === "undefined" || rouletteVideo.paused || rouletteVideo.ended) return;

    try {
      const displaySize = { width: rouletteVideo.offsetWidth, height: rouletteVideo.offsetHeight };
      
      const detections = await faceapi.detectAllFaces(
        rouletteVideo,
        new faceapi.TinyFaceDetectorOptions()
      );
      
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      
      if (resizedDetections.length > 0) {
        currentDetections = resizedDetections;
        frameCount = 0; // Reset counter jika wajah ditemukan
      } else {
        frameCount++; // Tambah counter jika wajah hilang di frame ini
      }

      // Jika wajah ada ATAU wajah hilang sebentar (kurang dari 10 frame / ~2 detik) = LOCK TARGET
      if (currentDetections.length > 0 && frameCount < 10) {
        noFaceWarning.classList.add("hidden");
        btnStartGacha.classList.remove("hidden");
        rouletteStatus.textContent = `${currentDetections.length} Wajah terdeteksi! Tekan "Mulai Gacha" jika siap.`;

        // Render bounding box/indikator wajah dari posisi terakhir
        faceOverlaysContainer.innerHTML = "";
        currentDetections.forEach((det) => {
          const indicator = document.createElement("div");
          indicator.style.position = "absolute";
          indicator.style.left = `${det.box.x}px`;
          indicator.style.top = `${det.box.y}px`;
          indicator.style.width = `${det.box.width}px`;
          indicator.style.height = `${det.box.height}px`;
          indicator.style.border = "3px dashed #00e676";
          indicator.style.borderRadius = "15px";
          indicator.style.boxShadow = "0 0 10px rgba(0,230,118,0.5)";
          indicator.style.pointerEvents = "none";
          
          const label = document.createElement("div");
          label.textContent = "Wajah Terdeteksi";
          label.style.position = "absolute";
          label.style.top = "-25px";
          label.style.left = "50%";
          label.style.transform = "translateX(-50%)";
          label.style.background = "#00e676";
          label.style.color = "#000";
          label.style.padding = "2px 8px";
          label.style.borderRadius = "10px";
          label.style.fontSize = "12px";
          label.style.fontWeight = "bold";
          label.style.whiteSpace = "nowrap";
          
          indicator.appendChild(label);
          faceOverlaysContainer.appendChild(indicator);
        });
      } else {
        // Wajah benar-benar hilang cukup lama
        currentDetections = [];
        btnStartGacha.classList.add("hidden");
        rouletteStatus.textContent = "Mencari wajah...";
        faceOverlaysContainer.innerHTML = ""; // Bersihkan indikator
        
        if (frameCount > 25) {
          noFaceWarning.classList.remove("hidden");
        }
      }
    } catch (error) {
      console.error("Detection error:", error);
      rouletteStatus.textContent = "Error AI: " + error.message;
    }
  }, 200);
}

// Start Gacha Logic
if (btnStartGacha) {
  btnStartGacha.addEventListener("click", () => {
    if (currentDetections.length === 0 || rouletteClubs.length === 0) return;
    
    // Hentikan pelacakan
    clearInterval(faceDetectionInterval);
    btnStartGacha.classList.add("hidden");
    rouletteStatus.textContent = "🎰 Mengundi klub...";

    // Render Overlay untuk setiap wajah
    faceOverlaysContainer.innerHTML = "";
    const activeSpinners = [];

    currentDetections.forEach((det, index) => {
      const overlay = document.createElement("div");
      overlay.className = "face-overlay is-spinning";
      // Posisi di atas kepala (tengah X, pucuk Y)
      overlay.style.left = `${det.box.x + det.box.width / 2}px`;
      overlay.style.top = `${det.box.y}px`;

      overlay.innerHTML = `
        <div class="spinner-logo"></div>
        <div class="spinner-name">...</div>
      `;
      faceOverlaysContainer.appendChild(overlay);

      activeSpinners.push({
        el: overlay,
        logo: overlay.querySelector(".spinner-logo"),
        name: overlay.querySelector(".spinner-name")
      });
    });

    // Spin animation
    let spinCount = 0;
    const totalSpins = 20;
    const spinIntervalMs = 100;

    const spinTimer = setInterval(() => {
      activeSpinners.forEach(spinner => {
        const randomClub = rouletteClubs[Math.floor(Math.random() * rouletteClubs.length)];
        if (randomClub.logo_url) {
          spinner.logo.innerHTML = `<img src="${randomClub.logo_url}" alt="${randomClub.nama}" style="width:100%;height:100%;object-fit:contain;border-radius:50%;">`;
        } else {
          const initials = randomClub.nama.substring(0, 2).toUpperCase();
          const bgColor = getRandomColor();
          spinner.logo.innerHTML = `<div class="logo-placeholder" style="background:${bgColor};width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;">${initials}</div>`;
        }
        spinner.name.textContent = randomClub.nama;
      });
      spinCount++;

      if (spinCount >= totalSpins) {
        clearInterval(spinTimer);
        
        // Pilih klub final secara unik jika klub cukup
        const finalClubs = [];
        let availableClubs = [...rouletteClubs];
        
        activeSpinners.forEach(spinner => {
          if (availableClubs.length === 0) availableClubs = [...rouletteClubs]; // fallback jika klub sedikit
          const randIndex = Math.floor(Math.random() * availableClubs.length);
          const selected = availableClubs[randIndex];
          finalClubs.push(selected);
          availableClubs.splice(randIndex, 1); // pastikan tidak duplikat

          spinner.el.classList.remove("is-spinning");
          spinner.el.classList.add("is-result");
          
          if (selected.logo_url) {
            spinner.logo.innerHTML = `<img src="${selected.logo_url}" alt="${selected.nama}" style="width:100%;height:100%;object-fit:contain;border-radius:50%;">`;
          } else {
            const initials = selected.nama.substring(0, 2).toUpperCase();
            const bgColor = getRandomColor();
            spinner.logo.innerHTML = `<div class="logo-placeholder" style="background:${bgColor};width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;">${initials}</div>`;
          }
          spinner.name.textContent = selected.nama;
        });
        
        rouletteStatus.textContent = "🎉 Selesai! Silakan catat hasilnya.";
      }
    }, spinIntervalMs);
  });
}

// Warna random untuk placeholder
function getRandomColor() {
  const colors = [
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#e67e22",
    "#34495e",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Tutup modal kamera
function handleCloseCameraModal() {
  cameraModal.classList.add("hidden");

  clearRouletteTimers();
  isRouletteSpinning = false;
  rouletteSpinner.classList.remove("is-spinning");

  // Hentikan stream kamera
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  // Reset state
  faceDetected = false;
  rouletteClubs = [];
  selectedCategory = "";
}

if (closeCameraModal) {
  closeCameraModal.addEventListener("click", handleCloseCameraModal);
}

// ==========================================
// FITUR SHARE MATCH RESULT
// ==========================================
const shareModal = document.getElementById("share-modal");
const closeShareModal = document.getElementById("close-share-modal");
const btnDownloadShare = document.getElementById("btn-download-share");

function openShareModal(matchId) {
  const m = state.matches.find(x => x.id === matchId);
  if (!m || m.status !== "completed") return;

  // Populate data
  document.getElementById("share-tournament-name").innerText = state.nama.toUpperCase();
  
  // Format the round stage display
  let stageText = "HASIL PERTANDINGAN";
  if (m.round) {
    if (typeof m.round === "number") {
      stageText = `MATCHDAY ${m.round}`;
    } else {
      stageText = String(m.round).toUpperCase();
    }
  }
  document.getElementById("share-match-stage").innerText = stageText;

  let scoreA = m.scoreA;
  let scoreB = m.scoreB;
  let aggText = "";

  // Jika Round Robin Double Leg dan ini adalah match leg 2
  if (state.sistem === "round_robin" && state.rrType === "double" && m.leg === 2) {
    const leg1Match = state.matches.find(match =>
      match.leg === 1 &&
      ((match.playerA.id === m.playerA.id && match.playerB.id === m.playerB.id) ||
      (match.playerA.id === m.playerB.id && match.playerB.id === m.playerA.id)) &&
      match.status === "completed"
    );
    if (leg1Match) {
      let l1A = leg1Match.playerA.id === m.playerA.id ? leg1Match.scoreA : leg1Match.scoreB;
      let l1B = leg1Match.playerA.id === m.playerA.id ? leg1Match.scoreB : leg1Match.scoreA;
      scoreA += l1A;
      scoreB += l1B;
      aggText = `Leg 1: ${l1A}-${l1B} | Leg 2: ${m.scoreA}-${m.scoreB}`;
    }
  }

  document.getElementById("share-team-a").innerText = m.playerA.nama_tim;
  document.getElementById("share-player-a").innerText = m.playerA.nama_pemain;
  document.getElementById("share-team-b").innerText = m.playerB.nama_tim;
  document.getElementById("share-player-b").innerText = m.playerB.nama_pemain;
  document.getElementById("share-score").innerText = `${scoreA} - ${scoreB}`;

  const aggInfo = document.getElementById("share-aggregate-info");
  if (aggText) {
    aggInfo.innerText = aggText;
    aggInfo.style.display = "inline-block";
  } else {
    aggInfo.style.display = "none";
  }

  const btnEditMatch = document.getElementById("btn-edit-match");
  if (btnEditMatch) {
    btnEditMatch.onclick = () => {
      shareModal.classList.add("hidden");
      openScoreModal(matchId);
    };
  }

  shareModal.classList.remove("hidden");
}

if (closeShareModal) {
  closeShareModal.onclick = () => shareModal.classList.add("hidden");
}

if (btnDownloadShare) {
  btnDownloadShare.onclick = async () => {
    const card = document.getElementById("share-graphic-card");
    const originalBtnText = btnDownloadShare.innerText;
    btnDownloadShare.innerText = "Memproses...";
    btnDownloadShare.disabled = true;

    try {
      const canvas = await html2canvas(card, {
        scale: 3,
        backgroundColor: "#0f172a",
        logging: false,
        useCORS: true
      });
      
      const imageURI = canvas.toDataURL("image/png");
      
      // Jika di HP, gunakan Web Share API jika didukung
      if (navigator.share) {
        const res = await fetch(imageURI);
        const blob = await res.blob();
        const file = new File([blob], 'hasil-pertandingan.png', { type: 'image/png' });
        try {
          await navigator.share({
            title: 'Hasil Pertandingan Yota League',
            files: [file]
          });
          btnDownloadShare.innerText = originalBtnText;
          btnDownloadShare.disabled = false;
          return;
        } catch (err) {
          console.log("Share API gagal/dibatalkan:", err);
        }
      }
      
      // Fallback: Download file
      const link = document.createElement("a");
      link.download = `YotaLeague-Result.png`;
      link.href = imageURI;
      link.click();
      
    } catch (error) {
      console.error("Gagal membuat gambar:", error);
      alert("Maaf, gagal membuat gambar untuk dibagikan.");
    }

    btnDownloadShare.innerText = originalBtnText;
    btnDownloadShare.disabled = false;
  };
}
