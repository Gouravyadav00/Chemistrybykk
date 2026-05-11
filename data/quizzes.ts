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

export const QUIZZES: QuizDefinition[] = [
  {
    classId: "9",
    chapterSlug: "matter-in-our-surroundings",
    title: "Matter in Our Surroundings",
    durationSec: 10 * 60,
    questionsPerAttempt: 20,
    questions: matterClass9,
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
