export type Language = 'en' | 'cs';

export const translations = {
  en: {
    title: "LCG Visualizer",
    subtitle: "The Planes Problem (Marsaglia's Theorem)",
    formulaTitle: "Generator Formula",
    show: "Show",
    hide: "Hide",
    formulaDescription: "Linear Congruential Generators generate pseudo-random numbers by iterating this modular equation. Poor choices of ´a´ and ´m´ lead to points falling on hyperplanes in 3D space.",
    presetsTitle: "Presets",
    initialSeed: "Initial Seed",
    addPoints: "Add Points",
    total: "Total",
    clear: "Clear",
    regenerate: "Regenerate",
    interactiveView: "Interactive 3D View",
    viewDescription: "Rotate the cube to find the angle where points align into planes. This demonstrates the lattice structure inherent to LCGs.",
    dragToRotate: "Drag to Rotate",
    scrollToZoom: "Scroll to Zoom",
    autoRotateOn: "Auto-Rotate ON",
    autoRotateOff: "Auto-Rotate OFF",
    xAxis: "X Axis",
    yAxis: "Y Axis",
    zAxis: "Z Axis",
    spectralTest: "Spectral Test",
    distance: "Plane Distance",
    normalVector: "Normal Vector",
    performTest: "Perform Test",
    spectralResult: "Spectral Test Result",
    planesCount: "Max Planes",
    selectPlane: "Select Plane",
    none: "None",
    closeTest: "Close Test",
    shuffle: "Bays-Durham Shuffle (128 numbers)",
    shuffleOn: "Shuffle ON",
    shuffleOff: "Shuffle OFF",
    shuffleWarning: "Note: Shuffling breaks the lattice structure. Points will no longer align with the spectral test planes.",
    copyright: "© Richard Lipka, lipka@kiv.zcu.cz",
    presets: {
      randu: {
        name: "IBM RANDU (Infamous)",
        description: "The classic example of a bad LCG. In 3D, all points fall onto just 15 planes."
      },
      glibc: {
        name: "glibc (Standard)",
        description: "A more modern LCG used in many Unix systems. Much better distribution."
      },
      msvc: {
        name: "MS Visual C++",
        description: "Used in older Windows environments. Decent but still has lattice structures."
      },
      minimal: {
        name: "Tiny LCG (Educational)",
        description: "A very small generator to easily see the repeating cycle and lattice."
      },
      tinyA: {
        name: "Tiny A (10 Planes)",
        description: "m=1000, a=31. Clear lattice with approximately 10 planes."
      },
      tinyB: {
        name: "Tiny B (8 Planes)",
        description: "m=128, a=9. Small power-of-two modulus with 8 planes."
      },
      tinyC: {
        name: "Tiny C (16 Planes)",
        description: "m=256, a=13. Demonstrates lattice in a standard 8-bit range."
      },
      tinyD: {
        name: "Tiny D (12 Planes)",
        description: "m=512, a=21. Another example of structured randomness."
      }
    }
  },
  cs: {
    title: "LCG Vizualizátor",
    subtitle: "Problém rovin (Marsagliův teorém)",
    formulaTitle: "Vzorec generátoru",
    show: "Zobrazit",
    hide: "Skrýt",
    formulaDescription: "Lineární kongruentní generátory generují pseudonáhodná čísla opakovaným výpočtem tohoto vzorce. Nevhodná volba parametrů ´a´ a ´m´ vede k tomu, že body v 3D prostoru leží v nadrovinách.",
    presetsTitle: "Předvolby",
    initialSeed: "Počáteční seed",
    addPoints: "Přidat body",
    total: "Celkem",
    clear: "Vymazat",
    regenerate: "Přegenerovat",
    interactiveView: "Interaktivní 3D pohled",
    viewDescription: "Otáčejte kostkou, dokud nenajdete úhel, kde se body srovnají do rovin. To demonstruje mřížkovou strukturu vlastní LCG generátorům.",
    dragToRotate: "Tažením otáčejte",
    scrollToZoom: "Kolečkem přibližujte",
    autoRotateOn: "Auto-rotace ZAP",
    autoRotateOff: "Auto-rotace VYP",
    xAxis: "Osa X",
    yAxis: "Osa Y",
    zAxis: "Osa Z",
    spectralTest: "Spektrální test",
    distance: "Vzdálenost rovin",
    normalVector: "Normálový vektor",
    performTest: "Provést test",
    spectralResult: "Výsledek spektrálního testu",
    planesCount: "Max. počet rovin",
    selectPlane: "Vybrat rovinu",
    none: "Žádná",
    closeTest: "Zavřít test",
    shuffle: "Bays-Durhamovo míchání (128 čísel)",
    shuffleOn: "Míchání ZAP",
    shuffleOff: "Míchání VYP",
    shuffleWarning: "Poznámka: Míchání rozbíjí mřížkovou strukturu. Body již nebudou odpovídat rovinám ze spektrálního testu.",
    copyright: "© Richard Lipka, lipka@kiv.zcu.cz",
    presets: {
      randu: {
        name: "IBM RANDU (Nechvalně známý)",
        description: "Klasický příklad špatného LCG. V 3D všechny body leží v pouhých 15 rovinách."
      },
      glibc: {
        name: "glibc (Standardní)",
        description: "Modernější LCG používaný v mnoha Unixových systémech. Mnohem lepší distribuce."
      },
      msvc: {
        name: "MS Visual C++",
        description: "Používaný ve starších prostředích Windows. Slušný, ale stále má mřížkové struktury."
      },
      minimal: {
        name: "Malý LCG (Edukační)",
        description: "Velmi malý generátor pro snadné pozorování opakujícího se cyklu a mřížky."
      },
      tinyA: {
        name: "Malý A (10 rovin)",
        description: "m=1000, a=31. Jasná mřížka s přibližně 10 rovinami."
      },
      tinyB: {
        name: "Malý B (8 rovin)",
        description: "m=128, a=9. Malý mocninný modulus se 8 rovinami."
      },
      tinyC: {
        name: "Malý C (16 rovin)",
        description: "m=256, a=13. Demonstruje mřížku v 8-bitovém rozsahu."
      },
      tinyD: {
        name: "Malý D (12 rovin)",
        description: "m=512, a=21. Další příklad strukturované náhodnosti."
      }
    }
  }
};
