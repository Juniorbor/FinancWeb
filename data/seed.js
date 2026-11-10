// Dados reais extraídos integralmente da planilha de Tomos e Traçados (Fernando e Bernardo)
const initialData = {
  config: {
    tabelaPrecos: {
      "UM DENTE": 10,
      "MAX OU MAND": 15,
      "MAX E MAND": 20,
      "TRAÇADO": 4
    },
    grupos: {
      FERNANDO: {
        nome: "Fernando",
        cidades: [
          { id: "Ariquemes", nome: "Ariquemes", sigla: "ARI" },
          { id: "PVH", nome: "Porto Velho (PVH)", sigla: "PVH" },
          { id: "Machadinho", nome: "Machadinho", sigla: "MAC" },
          { id: "Cacoal", nome: "Cacoal", sigla: "CAC" }
        ]
      },
      BERNARDO: {
        nome: "Bernardo",
        cidades: [
          { id: "Jipa", nome: "Ji-Paraná (Jipa)", sigla: "JIPA" },
          { id: "Ouro", nome: "Ouro Preto", sigla: "OURO" },
          { id: "Rolim", nome: "Rolim de Moura", sigla: "ROLIM" }
        ]
      }
    }
  },
  laudos: [
    // ================= CONTROLE TOMOS - FERNANDO =================
    // Ariquemes (16 exames = R$ 200)
    { uid: "tf-ari-1", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72479", data: "2026-11-03", paciente: "EVERALDO", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-ari-2", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72539", data: "2026-10-04", paciente: "REGINA", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-ari-3", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72798", data: "2026-11-03", paciente: "IRACEMA", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-ari-4", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72505", data: "2026-11-03", paciente: "JAIME", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-ari-5", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72506", data: "2026-11-03", paciente: "ERIKA", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-ari-6", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72500", data: "2026-11-03", paciente: "AURICEIA", regiao: "MAX E MAND", valor: 20 },
    { uid: "tf-ari-7", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72513", data: "2026-11-03", paciente: "JOAO", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-ari-8", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72520", data: "2026-11-04", paciente: "MARCIEL", regiao: "MAX OU MAND", valor: 15 },
    { uid: "tf-ari-9", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72529", data: "2026-11-04", paciente: "ZELIA", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-ari-10", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72537", data: "2026-11-04", paciente: "JOARLETE", regiao: "MAX OU MAND", valor: 15 },
    { uid: "tf-ari-11", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72533", data: "2026-11-04", paciente: "DAYANE", regiao: "MAX OU MAND", valor: 15 },
    { uid: "tf-ari-12", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72559", data: "2026-11-05", paciente: "ELIRANI", regiao: "MAX OU MAND", valor: 15 },
    { uid: "tf-ari-13", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "76561", data: "2026-11-05", paciente: "KEILA", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-ari-14", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72552", data: "2026-11-05", paciente: "ENIVAL", regiao: "MAX OU MAND", valor: 15 },
    { uid: "tf-ari-15", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72567", data: "2026-11-05", paciente: "CAROLINA", regiao: "MAX OU MAND", valor: 15 },
    { uid: "tf-ari-16", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Ariquemes", codigo: "72590", data: "2026-11-07", paciente: "RUDINEI", regiao: "UM DENTE", valor: 10 },

    // PVH (13 exames = R$ 195)
    { uid: "tf-pvh-1", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46208", data: "2026-11-03", paciente: "SANDRA", regiao: "MAX OU MAND", valor: 15 },
    { uid: "tf-pvh-2", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46098", data: "2026-11-03", paciente: "MARIA", regiao: "MAX OU MAND", valor: 15 },
    { uid: "tf-pvh-3", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46216", data: "2026-11-03", paciente: "VANDERLEIA", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-pvh-4", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46276", data: "2026-11-04", paciente: "VALDEMARINA", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-pvh-5", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46326", data: "2026-11-05", paciente: "GISLENY", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-pvh-6", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46283", data: "2026-11-05", paciente: "ANDRESA", regiao: "UM DENTE", valor: 10 },
    { uid: "tf-pvh-7", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46217", data: "2026-10-31", paciente: "ISRAEL", regiao: "MAX E MAND", valor: 20 },
    { uid: "tf-pvh-8", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46234", data: "2026-11-03", paciente: "FABIO", regiao: "MAX E MAND", valor: 20 },
    { uid: "tf-pvh-9", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46301", data: "2026-11-04", paciente: "CHARLES", regiao: "MAX E MAND", valor: 20 },
    { uid: "tf-pvh-10", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46304", data: "2026-11-04", paciente: "MELISSA", regiao: "MAX E MAND", valor: 20 },
    { uid: "tf-pvh-11", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46374", data: "2026-11-09", paciente: "NIDIA", regiao: "MAX E MAND", valor: 20 },
    { uid: "tf-pvh-12", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46370", data: "2026-11-06", paciente: "JAQUELINE", regiao: "MAX OU MAND", valor: 15 },
    { uid: "tf-pvh-13", responsavel: "FERNANDO", tipo: "TOMO", cidade: "PVH", codigo: "46446", data: "2026-11-09", paciente: "ANDRE", regiao: "UM DENTE", valor: 10 },

    // Machadinho (3 exames = R$ 50)
    { uid: "tf-mac-1", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Machadinho", codigo: "14959", data: "2026-11-04", paciente: "NEDINEIA", regiao: "MAX E MAND", valor: 20 },
    { uid: "tf-mac-2", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Machadinho", codigo: "14963", data: "2026-11-04", paciente: "VALNEIR", regiao: "MAX OU MAND", valor: 15 },
    { uid: "tf-mac-3", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Machadinho", codigo: "14976", data: "2026-11-06", paciente: "POLIANA", regiao: "MAX OU MAND", valor: 15 },

    // Cacoal (1 exame = R$ 15)
    { uid: "tf-cac-1", responsavel: "FERNANDO", tipo: "TOMO", cidade: "Cacoal", codigo: "75011", data: "2026-11-06", paciente: "KAYQYE", regiao: "MAX OU MAND", valor: 15 },

    // ================= CONTROLE TRAÇADOS - FERNANDO =================
    // Ariquemes (10 exames = R$ 40)
    { uid: "trf-ari-1", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Ariquemes", codigo: "72423", data: "2026-10-28", paciente: "MARCELO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-ari-2", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Ariquemes", codigo: "72507", data: "2026-11-03", paciente: "AILTON", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-ari-3", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Ariquemes", codigo: "72501", data: "2026-11-03", paciente: "GEOVANA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-ari-4", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Ariquemes", codigo: "72472", data: "2026-10-03", paciente: "EDUARDA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-ari-5", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Ariquemes", codigo: "72489", data: "2026-10-03", paciente: "KARINE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-ari-6", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Ariquemes", codigo: "72491", data: "2026-10-03", paciente: "DAVI", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-ari-7", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Ariquemes", codigo: "72496", data: "2026-11-03", paciente: "ANA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-ari-8", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Ariquemes", codigo: "72530", data: "2026-11-04", paciente: "ANA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-ari-9", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Ariquemes", codigo: "72549", data: "2026-11-05", paciente: "VALDEMAR", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-ari-10", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Ariquemes", codigo: "72533", data: "2026-11-04", paciente: "DAYANNE", regiao: "TRAÇADO", valor: 4 },

    // PVH (25 exames = R$ 100)
    { uid: "trf-pvh-1", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46165", data: "2026-10-30", paciente: "VALCINEIDE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-2", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46258", data: "2026-11-03", paciente: "JENNIFER", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-3", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46256", data: "2026-11-03", paciente: "GABRIELLE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-4", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46224", data: "2026-11-03", paciente: "AGATHA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-5", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46223", data: "2026-10-03", paciente: "JOAO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-6", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46253", data: "2026-11-04", paciente: "PAULO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-7", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46303", data: "2026-11-04", paciente: "ISAIAS", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-8", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46282", data: "2026-11-04", paciente: "FRANCISCA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-9", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46274", data: "2026-11-04", paciente: "ANA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-10", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46304", data: "2026-11-04", paciente: "MELISSA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-11", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46240", data: "2026-11-04", paciente: "JOSELAINE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-12", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46238", data: "2026-11-04", paciente: "JAMES", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-13", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46293", data: "2026-11-04", paciente: "PEROLA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-14", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46285", data: "2026-11-04", paciente: "ROSIMEIRE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-15", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46325", data: "2026-11-05", paciente: "JOEL", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-16", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46312", data: "2026-11-05", paciente: "JANIELE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-17", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46373", data: "2026-11-06", paciente: "FABIO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-18", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46409", data: "2026-11-07", paciente: "JOSUE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-19", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46355", data: "2026-11-07", paciente: "VIVIAN", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-20", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46368", data: "2026-11-06", paciente: "ADRIANA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-21", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46387", data: "2026-11-06", paciente: "LAIZY", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-22", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46384", data: "2026-11-06", paciente: "JENNEFER", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-23", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46396", data: "2026-11-06", paciente: "IGOR", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-24", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46329", data: "2026-11-05", paciente: "BRUNO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-pvh-25", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "PVH", codigo: "46416", data: "2026-11-09", paciente: "RAIANA", regiao: "TRAÇADO", valor: 4 },

    // Machadinho (6 exames = R$ 24)
    { uid: "trf-mac-1", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Machadinho", codigo: "14953", data: "2026-11-03", paciente: "EMANUELE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-mac-2", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Machadinho", codigo: "14955", data: "2026-11-04", paciente: "ROBSON", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-mac-3", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Machadinho", codigo: "14958", data: "2026-11-04", paciente: "EDSON", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-mac-4", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Machadinho", codigo: "14974", data: "2026-11-05", paciente: "CLEITON", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-mac-5", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Machadinho", codigo: "14961", data: "2026-11-04", paciente: "RAFAEL", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-mac-6", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Machadinho", codigo: "14968", data: "2026-11-05", paciente: "EMILLY", regiao: "TRAÇADO", valor: 4 },

    // Cacoal (17 exames = R$ 68)
    { uid: "trf-cac-1", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "74890", data: "2026-10-30", paciente: "CLAUDETE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-2", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "74919", data: "2026-11-03", paciente: "JULIANA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-3", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "74926", data: "2026-11-03", paciente: "NICOLLAS", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-4", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "74928", data: "2026-11-03", paciente: "GEFERSON", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-5", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "74910", data: "2026-11-03", paciente: "POLLIANA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-6", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "74903", data: "2026-11-04", paciente: "ROMANO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-7", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "74976", data: "2026-11-04", paciente: "GUILHERME", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-8", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "74964", data: "2026-11-04", paciente: "JOAO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-9", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "74945", data: "2026-11-04", paciente: "ROSICLELA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-10", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "74929", data: "2026-11-04", paciente: "GAEL", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-11", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "74959", data: "2026-11-04", paciente: "ELZINE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-12", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "75035", data: "2026-11-07", paciente: "HELLOISA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-13", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "75008", data: "2026-11-06", paciente: "LUCAS", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-14", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "75010", data: "2026-11-06", paciente: "ADRIANA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-15", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "75023", data: "2026-11-06", paciente: "ELOA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-16", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "75030", data: "2026-11-07", paciente: "ERASMO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trf-cac-17", responsavel: "FERNANDO", tipo: "TRACADO", cidade: "Cacoal", codigo: "75032", data: "2026-11-07", paciente: "HENRIQUE", regiao: "TRAÇADO", valor: 4 },

    // ================= CONTROLE TOMOS - BERNARDO =================
    // Ouro (2 exames = R$ 30)
    { uid: "tb-our-1", responsavel: "BERNARDO", tipo: "TOMO", cidade: "Ouro", codigo: "58255", data: "2026-11-04", paciente: "HELENA", regiao: "MAX OU MAND", valor: 15 },
    { uid: "tb-our-2", responsavel: "BERNARDO", tipo: "TOMO", cidade: "Ouro", codigo: "58279", data: "2026-11-04", paciente: "ELIANE", regiao: "MAX OU MAND", valor: 15 },

    // ================= CONTROLE TRAÇADOS - BERNARDO =================
    // Jipa (20 exames = R$ 80)
    { uid: "trb-jip-1", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82914", data: "2026-11-03", paciente: "KAUAN", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-2", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82912", data: "2026-11-03", paciente: "THAINA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-3", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82913", data: "2026-11-03", paciente: "ARTHUR", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-4", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82915", data: "2026-11-03", paciente: "HENZO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-5", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82954", data: "2026-11-04", paciente: "HADASSA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-6", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82936", data: "2026-11-04", paciente: "ANDRESSA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-7", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82925", data: "2026-11-04", paciente: "NILZA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-8", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82992", data: "2026-10-31", paciente: "THIAGO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-9", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82919", data: "2026-11-03", paciente: "PAULA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-10", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82902", data: "2026-11-03", paciente: "EDUARDO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-11", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82938", data: "2026-11-04", paciente: "DANIELLE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-12", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82974", data: "2026-11-05", paciente: "VILMA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-13", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82963", data: "2026-11-05", paciente: "RAFAEL", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-14", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82961", data: "2026-11-05", paciente: "BRUNO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-15", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82945", data: "2026-11-04", paciente: "ANDRE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-16", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82985", data: "2026-11-06", paciente: "JONATAS", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-17", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82989", data: "2026-11-06", paciente: "JOAO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-18", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82980", data: "2026-11-06", paciente: "NICOLLY", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-19", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "82993", data: "2026-11-07", paciente: "ADRIANA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-jip-20", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Jipa", codigo: "83027", data: "2026-11-09", paciente: "DENILZA", regiao: "TRAÇADO", valor: 4 },

    // Ouro (10 exames = R$ 40)
    { uid: "trb-our-1", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Ouro", codigo: "58269", data: "2026-11-03", paciente: "TAUA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-our-2", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Ouro", codigo: "58262", data: "2026-11-03", paciente: "DIRCILEIA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-our-3", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Ouro", codigo: "58282", data: "2026-11-03", paciente: "OLEEL", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-our-4", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Ouro", codigo: "58327", data: "2026-11-07", paciente: "GABRIELI", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-our-5", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Ouro", codigo: "58324", data: "2026-11-07", paciente: "EDIVANIA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-our-6", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Ouro", codigo: "58318", data: "2026-11-06", paciente: "AMANDA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-our-7", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Ouro", codigo: "58312", data: "2026-11-06", paciente: "RONAN", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-our-8", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Ouro", codigo: "58328", data: "2026-11-07", paciente: "MIGUEL", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-our-9", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Ouro", codigo: "58323", data: "2026-11-07", paciente: "GUILHERME", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-our-10", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Ouro", codigo: "58296", data: "2026-11-05", paciente: "PIETRO", regiao: "TRAÇADO", valor: 4 },

    // Rolim (24 exames = R$ 96)
    { uid: "trb-rol-1", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72870", data: "2026-11-03", paciente: "ANA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-2", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72852", data: "2026-11-03", paciente: "FABIO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-3", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72874", data: "2026-11-03", paciente: "LEANDRO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-4", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72868", data: "2026-01-03", paciente: "FABIULA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-5", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72992", data: "2026-10-04", paciente: "RAFAELA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-6", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72997", data: "2026-11-04", paciente: "LARA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-7", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72901", data: "2026-11-04", paciente: "HELENA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-8", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72924", data: "2026-11-05", paciente: "LAURA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-9", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72932", data: "2026-11-05", paciente: "KARINE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-10", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72916", data: "2026-11-05", paciente: "JANAINA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-11", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72928", data: "2026-11-05", paciente: "GABRIEL", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-12", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72925", data: "2026-11-05", paciente: "SUELLEN", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-13", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72921", data: "2026-11-05", paciente: "VALCIR", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-14", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72906", data: "2026-11-05", paciente: "KATIA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-15", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72911", data: "2026-11-05", paciente: "EVELYN", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-16", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72951", data: "2026-11-06", paciente: "ENZO", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-17", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72968", data: "2026-11-07", paciente: "NICOLY", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-18", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72964", data: "2026-11-07", paciente: "OZEIAS", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-19", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72963", data: "2026-11-06", paciente: "MARIA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-20", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72960", data: "2026-11-06", paciente: "ARTHUR", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-21", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72970", data: "2026-11-07", paciente: "CLAUDIANE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-22", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72953", data: "2026-11-06", paciente: "ELIANE", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-23", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72894", data: "2026-11-04", paciente: "SINEIA", regiao: "TRAÇADO", valor: 4 },
    { uid: "trb-rol-24", responsavel: "BERNARDO", tipo: "TRACADO", cidade: "Rolim", codigo: "72965", data: "2026-11-07", paciente: "LUCAS", regiao: "TRAÇADO", valor: 4 }
  ]
};

module.exports = initialData;
