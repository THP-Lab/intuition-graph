// src/nodeColors.js

// Node color definitions
export const NODE_COLORS = {
  SUBJECT: "#4361EE", // Vibrant blue for subjects
  PREDICATE: "#FF7300", // Orange for predicates
  OBJECT: "#9D4EDD", // Rich purple for objects
  CREATOR: "#00FF00", // Green for creators
};

// Helper function to get node color based on role
export const getNodeColor = (role) => {
  switch (role) {
    case "subject":
      return NODE_COLORS.SUBJECT;
    case "predicate":
      return NODE_COLORS.PREDICATE;
    case "object":
      return NODE_COLORS.OBJECT;
    case "creator":
      return NODE_COLORS.CREATOR;
    default:
      return NODE_COLORS.DEFAULT;
  }
};
