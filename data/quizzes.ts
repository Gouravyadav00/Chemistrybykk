export type QuizQuestion = {
  id: string;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
};

export type QuizDefinition = {
  classId: string;
  chapterSlug: string;
  title: string;
  durationSec: number;
  questionsPerAttempt: number;
  questions: QuizQuestion[];
};

const q = (
  id: string,
  text: string,
  options: [string, string, string, string],
  correct: 0 | 1 | 2 | 3,
): QuizQuestion => ({ id, text, options, correct });

const matterClass9: QuizQuestion[] = [
  q("1", "Which of the following is NOT a state of matter (classical)?", ["Solid", "Liquid", "Gas", "Energy"], 3),
  q("2", "The SI unit of temperature is", ["Celsius", "Fahrenheit", "Kelvin", "Joule"], 2),
  q("3", "To convert Celsius to Kelvin, we", ["Add 273", "Subtract 273", "Multiply by 273", "Divide by 273"], 0),
  q("4", "100°C is equal to", ["273 K", "373 K", "100 K", "0 K"], 1),
  q("5", "The boiling point of water at sea level is", ["0°C", "100°C", "273°C", "373°C"], 1),
  q("6", "The melting point of ice is", ["0°C", "100°C", "-10°C", "273°C"], 0),
  q("7", "The state of matter that has both definite shape and definite volume is", ["Solid", "Liquid", "Gas", "Plasma"], 0),
  q("8", "The state of matter that has no definite shape but a definite volume is", ["Solid", "Liquid", "Gas", "Plasma"], 1),
  q("9", "The state of matter with neither definite shape nor definite volume is", ["Solid", "Liquid", "Gas", "Plasma"], 2),
  q("10", "The intermolecular space is maximum in", ["Solids", "Liquids", "Gases", "All are the same"], 2),
  q("11", "The force of attraction between particles is strongest in", ["Solids", "Liquids", "Gases", "Plasma"], 0),
  q("12", "Particles of a solid", ["Move freely", "Vibrate about fixed positions", "Move in straight lines", "Are stationary"], 1),
  q("13", "Diffusion is fastest in", ["Solids", "Liquids", "Gases", "Same in all"], 2),
  q("14", "The intermixing of particles of two different types of matter on their own is called", ["Diffusion", "Effusion", "Osmosis", "Convection"], 0),
  q("15", "The phenomenon of change of liquid into vapour at any temperature below its boiling point is called", ["Evaporation", "Boiling", "Condensation", "Sublimation"], 0),
  q("16", "The direct change of a solid into a gas without passing through the liquid state is called", ["Evaporation", "Fusion", "Sublimation", "Condensation"], 2),
  q("17", "The direct change of a gas into a solid is called", ["Sublimation", "Deposition", "Condensation", "Fusion"], 1),
  q("18", "The amount of heat required to change unit mass of a solid into liquid at its melting point is called", ["Latent heat of vaporization", "Latent heat of fusion", "Specific heat", "Heat capacity"], 1),
  q("19", "Steam at 100°C causes more severe burns than boiling water at 100°C because", ["Steam has higher temperature", "Steam contains the latent heat of vaporization", "Steam has higher pressure", "Steam has higher density"], 1),
  q("20", "Solid carbon dioxide is commonly known as", ["Dry ice", "Wet ice", "Hard ice", "Black ice"], 0),
  q("21", "Naphthalene balls disappear with time without leaving any solid behind because of", ["Evaporation", "Sublimation", "Melting", "Decomposition"], 1),
  q("22", "Which of these sublimes at room temperature?", ["Sugar", "Salt", "Camphor", "Glucose"], 2),
  q("23", "The rate of evaporation increases with", ["Decrease in temperature", "Increase in humidity", "Increase in surface area", "Decrease in wind speed"], 2),
  q("24", "Cooling caused by evaporation is due to", ["Heat loss to surroundings", "Heat absorption from surroundings", "Pressure change", "Density change"], 1),
  q("25", "A desert cooler works better on a hot dry day because of", ["Higher temperature", "Lower humidity", "Higher humidity", "Stronger sunlight"], 1),
  q("26", "We feel cold after sweating because", ["Sweat itself is cold", "Sweat evaporates and absorbs body heat", "The air around us is cold", "Our body slows down"], 1),
  q("27", "The SI unit of pressure is", ["Newton", "Joule", "Pascal", "Watt"], 2),
  q("28", "One atmosphere is approximately equal to", ["760 mm of Hg", "76 mm of Hg", "1000 mm of Hg", "100 mm of Hg"], 0),
  q("29", "At constant temperature, when the pressure on a gas is increased, its volume", ["Increases", "Decreases", "Stays the same", "Becomes zero"], 1),
  q("30", "When a gas is compressed under high pressure and cooled, it generally changes to a", ["Liquid", "Solid", "Plasma", "BEC"], 0),
  q("31", "Density is generally highest in", ["Gases", "Liquids", "Solids", "All are equal"], 2),
  q("32", "Ice floats on water because", ["Ice has higher density than water", "Ice has lower density than water", "Of surface tension", "Of magnetic force"], 1),
  q("33", "The temperature at which a liquid starts boiling under atmospheric pressure is called", ["Boiling point", "Melting point", "Sublimation point", "Freezing point"], 0),
  q("34", "CNG stands for", ["Compressed Natural Gas", "Common Natural Gas", "Cooled Natural Gas", "Carbon Natural Gas"], 0),
  q("35", "LPG stands for", ["Liquid Petroleum Gas", "Liquefied Petroleum Gas", "Low Pressure Gas", "Light Propane Gas"], 1),
  q("36", "Plasma — the fourth state of matter — is found in", ["Ice", "Iron", "Stars and the Sun", "Wood"], 2),
  q("37", "BEC stands for", ["Boyle Einstein Condensate", "Bose Einstein Condensate", "Bose Energy Condensate", "Boyle Energy Condensate"], 1),
  q("38", "Particles of matter have", ["Space between them", "Force of attraction", "Kinetic energy", "All of these"], 3),
  q("39", "The kinetic energy of particles is highest in", ["Solids", "Liquids", "Gases", "All are equal"], 2),
  q("40", "Honey is more viscous than water because", ["It has stronger intermolecular forces", "It is hotter", "It has lower density", "It has less mass"], 0),
  q("41", "Which factor does NOT affect the rate of evaporation?", ["Temperature", "Surface area", "Wind speed", "Colour of the liquid"], 3),
  q("42", "The phenomenon of change of gas into liquid is called", ["Evaporation", "Sublimation", "Condensation", "Deposition"], 2),
  q("43", "The temperature at which a substance changes from liquid to solid is its", ["Boiling point", "Sublimation point", "Freezing point", "Critical temperature"], 2),
  q("44", "The pressure exerted by a gas on its container walls is due to", ["Gravity", "Collisions of particles with the walls", "Repulsion", "Cohesion"], 1),
  q("45", "The latent heat of fusion of ice is approximately", ["80 cal/g", "540 cal/g", "100 cal/g", "1 cal/g"], 0),
  q("46", "The latent heat of vaporization of water is approximately", ["80 cal/g", "540 cal/g", "273 cal/g", "1 cal/g"], 1),
  q("47", "Molecular movement is purely vibrational in", ["Solids", "Liquids", "Gases", "Plasma"], 0),
  q("48", "Liquids and gases together are called", ["Fluids", "Solids", "Plasma", "Non-fluids"], 0),
  q("49", "When dry ice is left in open air, it", ["Melts into water", "Sublimes directly into gas", "Boils into steam", "Remains unchanged"], 1),
  q("50", "The state of matter that has fixed mass and fixed volume but no fixed shape is", ["Solid", "Liquid", "Gas", "Plasma"], 1),
];

const chemicalReactionsClass10: QuizQuestion[] = [
  q("1", "A chemical equation is balanced according to the law of", ["Conservation of energy", "Conservation of mass", "Multiple proportions", "Definite proportions"], 1),
  q("2", "The symbol used for a reversible reaction is", ["→", "⇌", "↑", "↓"], 1),
  q("3", "The (aq) symbol after a substance in an equation means it is", ["A solid", "A liquid", "A gas", "An aqueous solution"], 3),
  q("4", "In Zn + H₂SO₄ → ZnSO₄ + H₂↑, the arrow ↑ indicates", ["A precipitate", "A gas evolved", "Heat absorbed", "A liquid"], 1),
  q("5", "The symbol ↓ in a chemical equation indicates", ["A gas is evolved", "Heat is released", "A precipitate is formed", "A reversible reaction"], 2),
  q("6", "Burning of magnesium ribbon in air is an example of", ["Decomposition reaction", "Combination reaction", "Displacement reaction", "Double displacement reaction"], 1),
  q("7", "2Mg + O₂ → 2MgO is a", ["Combination reaction", "Decomposition reaction", "Displacement reaction", "Double displacement reaction"], 0),
  q("8", "The product of the reaction CaO + H₂O is", ["Calcium hydroxide", "Calcium carbonate", "Calcium chloride", "Calcium sulphate"], 0),
  q("9", "Slaked lime is chemically", ["CaO", "Ca(OH)₂", "CaCO₃", "CaCl₂"], 1),
  q("10", "Quick lime is", ["CaO", "Ca(OH)₂", "CaCO₃", "CaSO₄"], 0),
  q("11", "A reaction in which a single reactant breaks down into two or more simpler products is called", ["Combination", "Decomposition", "Displacement", "Double displacement"], 1),
  q("12", "CaCO₃ → CaO + CO₂ on heating is an example of", ["Combination", "Thermal decomposition", "Displacement", "Photochemical decomposition"], 1),
  q("13", "Decomposition of a substance by passing electricity is called", ["Photolysis", "Electrolysis", "Pyrolysis", "Hydrolysis"], 1),
  q("14", "Decomposition of silver chloride in sunlight is an example of", ["Thermal decomposition", "Photochemical decomposition", "Electrolytic decomposition", "Combination"], 1),
  q("15", "When silver chloride is exposed to sunlight, it turns", ["White", "Grey", "Brown", "Green"], 1),
  q("16", "Silver bromide on exposure to light turns", ["Yellow", "Pale grey", "Red", "Blue"], 1),
  q("17", "Photographic films are coated with", ["Silver chloride", "Silver bromide", "Silver iodide", "Silver nitrate"], 1),
  q("18", "When zinc is added to copper sulphate solution, the blue colour", ["Remains the same", "Fades and becomes colourless", "Turns green", "Turns red"], 1),
  q("19", "Zn + CuSO₄ → ZnSO₄ + Cu is a", ["Combination reaction", "Decomposition reaction", "Displacement reaction", "Double displacement reaction"], 2),
  q("20", "NaCl + AgNO₃ → AgCl + NaNO₃ is a", ["Combination reaction", "Decomposition reaction", "Displacement reaction", "Double displacement reaction"], 3),
  q("21", "The white precipitate formed when AgNO₃ is added to NaCl solution is", ["NaNO₃", "AgCl", "NaCl", "Ag"], 1),
  q("22", "The insoluble solid product formed in a precipitation reaction is called a", ["Solute", "Solution", "Precipitate", "Filtrate"], 2),
  q("23", "In BaCl₂ + Na₂SO₄ → BaSO₄ + 2NaCl, the precipitate is", ["NaCl", "BaCl₂", "BaSO₄", "Na₂SO₄"], 2),
  q("24", "Loss of electrons by a substance is called", ["Reduction", "Oxidation", "Combustion", "Sublimation"], 1),
  q("25", "Gain of electrons by a substance is called", ["Oxidation", "Reduction", "Sublimation", "Hydrolysis"], 1),
  q("26", "In CuO + H₂ → Cu + H₂O, copper oxide is", ["Oxidised", "Reduced", "Both oxidised and reduced", "Unchanged"], 1),
  q("27", "In CuO + H₂ → Cu + H₂O, hydrogen is", ["Oxidised", "Reduced", "Both oxidised and reduced", "Unchanged"], 0),
  q("28", "A reaction in which oxidation and reduction occur simultaneously is called", ["Combustion reaction", "Sublimation", "Redox reaction", "Photolysis"], 2),
  q("29", "Rusting of iron is an example of", ["Reduction", "Combustion", "Corrosion (oxidation)", "Decomposition"], 2),
  q("30", "The chemical formula of rust is approximately", ["FeO", "Fe₂O₃·xH₂O", "Fe(OH)₂", "FeS"], 1),
  q("31", "Iron rusts faster in", ["Dry air", "Moist air", "Vacuum", "Cold dry air"], 1),
  q("32", "Coating iron with a layer of zinc to prevent rusting is called", ["Painting", "Galvanization", "Tinning", "Anodising"], 1),
  q("33", "The development of unpleasant smell and taste in oils and fats kept for long is called", ["Corrosion", "Rancidity", "Fermentation", "Hydrolysis"], 1),
  q("34", "Rancidity is caused mainly by", ["Reduction of fats", "Oxidation of fats and oils", "Sublimation", "Combustion"], 1),
  q("35", "To prevent rancidity, food packets of chips are flushed with", ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], 1),
  q("36", "Antioxidants are added to food to prevent", ["Rusting", "Rancidity", "Decay by bacteria", "Burning"], 1),
  q("37", "A chemical equation in which the number of atoms of each element is equal on both sides is called a", ["Skeletal equation", "Balanced equation", "Word equation", "Net equation"], 1),
  q("38", "Reactants in a chemical equation are written on the", ["Right of the arrow", "Left of the arrow", "Either side", "Below the arrow"], 1),
  q("39", "Products in a chemical equation are written on the", ["Right of the arrow", "Left of the arrow", "Either side", "Above the arrow"], 0),
  q("40", "A reaction in which heat is released is called", ["Endothermic reaction", "Exothermic reaction", "Reversible reaction", "Slow reaction"], 1),
  q("41", "A reaction that absorbs heat from the surroundings is called", ["Exothermic", "Endothermic", "Spontaneous", "Photochemical"], 1),
  q("42", "Respiration is an example of", ["Exothermic reaction", "Endothermic reaction", "Sublimation", "Decomposition only"], 0),
  q("43", "Photosynthesis is an example of", ["Exothermic reaction", "Endothermic reaction", "Displacement reaction", "Combination only"], 1),
  q("44", "Burning of natural gas in a stove is", ["Endothermic", "Exothermic", "Reversible", "Sublimation"], 1),
  q("45", "Among Cu, Zn, Fe and Mg, the most reactive metal is", ["Cu", "Zn", "Fe", "Mg"], 3),
  q("46", "Which of the following metals cannot displace hydrogen from a dilute acid?", ["Mg", "Zn", "Fe", "Cu"], 3),
  q("47", "When an iron nail is dipped in CuSO₄ solution, the solution slowly turns", ["Deeper blue", "Light green", "Red", "Colourless instantly"], 1),
  q("48", "Fe + CuSO₄ → FeSO₄ + Cu shows that iron is", ["More reactive than copper", "Less reactive than copper", "Equally reactive as copper", "Inert"], 0),
  q("49", "2H₂ + O₂ → 2H₂O is balanced according to", ["Law of definite proportions", "Law of conservation of mass", "Avogadro's law", "Boyle's law"], 1),
  q("50", "Solid carbon dioxide (dry ice) used in cold storage is written in an equation as", ["CO₂ (s)", "CO₂ (l)", "CO₂ (g)", "CO₂ (aq)"], 0),
];

export const QUIZZES: QuizDefinition[] = [
  {
    classId: "9",
    chapterSlug: "matter-in-our-surroundings",
    title: "Matter in Our Surroundings",
    durationSec: 10 * 60,
    questionsPerAttempt: 20,
    questions: matterClass9,
  },
  {
    classId: "10",
    chapterSlug: "chemical-reactions-and-equations",
    title: "Chemical Reactions and Equations",
    durationSec: 10 * 60,
    questionsPerAttempt: 20,
    questions: chemicalReactionsClass10,
  },
];

export function findQuiz(
  classId: string,
  chapterSlug: string,
): QuizDefinition | undefined {
  return QUIZZES.find(
    (q) => q.classId === classId && q.chapterSlug === chapterSlug,
  );
}

export function hasQuiz(classId: string, chapterSlug: string): boolean {
  return !!findQuiz(classId, chapterSlug);
}
