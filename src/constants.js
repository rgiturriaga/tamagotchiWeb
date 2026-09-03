export const SPECIES_META = {
  1: {
    name: "Flambit",
    type: "Fire",
    color: "#FF6B35",
    colorGlow: "rgba(255, 107, 53, 0.6)",
    bgGradient: "linear-gradient(135deg, #1a0800 0%, #2d0f00 50%, #0d0d0d 100%)",
    cardBg: "rgba(255, 107, 53, 0.08)",
    cardBorder: "rgba(255, 107, 53, 0.3)",
    images: ["/flambit.jpg", "/flambit.jpg", "/flambit.jpg"],
    description: "A feisty fire spirit with an eternal flame. Loves warm hugs and extra spicy food.",
    stages: ["Tiny Flambit", "Fire Lizard", "Inferno Dragon"],
  },
  2: {
    name: "Aquapup",
    type: "Water",
    color: "#4ECDC4",
    colorGlow: "rgba(78, 205, 196, 0.6)",
    bgGradient: "linear-gradient(135deg, #000d1a 0%, #001833 50%, #0d0d0d 100%)",
    cardBg: "rgba(78, 205, 196, 0.08)",
    cardBorder: "rgba(78, 205, 196, 0.3)",
    images: ["/aquapup.jpg", "/aquapup.jpg", "/aquapup.jpg"],
    description: "A bubbly water pup who loves to splash. Has the most adorable puppy eyes.",
    stages: ["Water Blob", "Aqua Puppy", "Sea Serpent"],
  },
  3: {
    name: "Leafling",
    type: "Grass",
    color: "#95E07A",
    colorGlow: "rgba(149, 224, 122, 0.6)",
    bgGradient: "linear-gradient(135deg, #001a00 0%, #002b00 50%, #0d0d0d 100%)",
    cardBg: "rgba(149, 224, 122, 0.08)",
    cardBorder: "rgba(149, 224, 122, 0.3)",
    images: ["/leafling.jpg", "/leafling.jpg", "/leafling.jpg"],
    description: "A gentle forest sprite who grows stronger with sunlight.",
    stages: ["Tiny Sprout", "Leaf Bunny", "Forest Guardian"],
  },
};

export const getStatColor = (value) => {
  if (value > 60) return "#95E07A";
  if (value > 30) return "#FFD166";
  return "#FF6B6B";
};

export const getMoodLabel = (pet) => {
  if (!pet.is_alive) return "Deceased";
  if (pet.is_sleeping) return "Sleeping";
  const avg = (pet.hunger + pet.happiness + pet.energy) / 3;
  if (avg > 70) return "Happy";
  if (avg > 50) return "Content";
  if (avg > 30) return "Neutral";
  if (avg > 10) return "Sad";
  return "Critical";
};
