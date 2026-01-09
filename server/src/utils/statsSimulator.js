
// Database of Team Strengths & Styles for Realistic Data Simulation
/*
    Styles:
    - "Aggressive": High Goals, High Corners (e.g., Liverpool, Bayern)
    - "Possession": High Corners, Control (e.g., Man City, Arsenal)
    - "Counter": Low Possession, Efficient (e.g., Real Madrid, Villa)
    - "Defensive": Low Goals, Grinders (e.g., Atletico, Italian teams)
*/

const TEAM_DATA = {
    // Premier League
    "Arsenal": { tier: 1, style: "Possession" },
    "Manchester City": { tier: 1, style: "Possession" },
    "Liverpool": { tier: 1, style: "Aggressive" },
    "Chelsea": { tier: 2, style: "Aggressive" },
    "Tottenham Hotspur": { tier: 2, style: "Aggressive" },
    "Newcastle United": { tier: 2, style: "Counter" },
    "Manchester United": { tier: 2, style: "Counter" },
    "Aston Villa": { tier: 2, style: "Counter" },
    "Brighton": { tier: 3, style: "Possession" },
    "West Ham United": { tier: 3, style: "Counter" },

    // Serie A
    "Inter": { tier: 1, style: "Defensive" },
    "AC Milan": { tier: 2, style: "Aggressive" },
    "Juventus": { tier: 1, style: "Defensive" },
    "Napoli": { tier: 2, style: "Aggressive" },

    // General Default
    "DEFAULT": { tier: 4, style: "Balanced" }
};

const getTeamData = (team) => TEAM_DATA[team] || TEAM_DATA["DEFAULT"];

const getTier = (team) => getTeamData(team).tier;

// Generate realistic "Last 5 Games" form based on Tier
const generateForm = (tier) => {
    const results = [];
    for (let i = 0; i < 5; i++) {
        const rand = Math.random();
        if (tier === 1) {
            // Elite: mostly Wins (60%), some Draws (25%), few Losses (15%)
            if (rand < 0.6) results.push('W');
            else if (rand < 0.85) results.push('D');
            else results.push('L');
        } else if (tier === 2) {
            // Strong: Win (45%), Draw (30%), Loss (25%)
            if (rand < 0.45) results.push('W');
            else if (rand < 0.75) results.push('D');
            else results.push('L');
        } else if (tier === 3) {
            // Mid: Win (30%), Draw (35%), Loss (35%)
            if (rand < 0.3) results.push('W');
            else if (rand < 0.65) results.push('D');
            else results.push('L');
        } else {
            // Low: Win (15%), Draw (30%), Loss (55%)
            if (rand < 0.15) results.push('W');
            else if (rand < 0.45) results.push('D');
            else results.push('L');
        }
    }
    return results.join('-');
};

const generateH2H = (home, away) => {
    const tierH = getTier(home);
    const tierA = getTier(away);

    // Simulate last 5 H2H games
    const games = [];
    for (let i = 0; i < 5; i++) {
        let hGoals = 0, aGoals = 0;
        const diff = tierA - tierH; // Positive means Home is better (since 1 is best) -> Wait. 1 is best.
        // If tierH=1, tierA=4. Diff = 3. Big mismatch.

        const baseHomeAdvantage = 0.3; // Home team usually scores more
        const strengthFactor = (tierA - tierH) * 0.5; // If Home is Tier 1 (1) and Away Tier 4 (4), factor = 1.5 (Home +)

        let homeLambda = 1.5 + baseHomeAdvantage + strengthFactor;
        let awayLambda = 1.0 - strengthFactor;
        if (homeLambda < 0.1) homeLambda = 0.1;
        if (awayLambda < 0.1) awayLambda = 0.1;

        // Simple Poisson-ish approximation
        hGoals = Math.floor(Math.random() * homeLambda * 2);
        aGoals = Math.floor(Math.random() * awayLambda * 2);

        games.push(`${home} ${hGoals}-${aGoals} ${away}`);
    }
    return games.join('; ');
};

// ... h2h generation logic remains similar but uses new getTier ...

export const getSimulatedAnalysis = (home, away) => {
    const homeData = getTeamData(home);
    const awayData = getTeamData(away);

    // Dynamic "Suggested Market" Logic
    let suggestedMarket = "Double Chance 1X";
    let reasoning = "Balanced matchup favoring home.";

    if (homeData.tier < awayData.tier) {
        // Home is Stronger
        if (homeData.style === "Aggressive") {
            suggestedMarket = "Over 2.5 Goals";
            reasoning = `${home} is an aggressive scoring team against weaker opposition.`;
        } else if (homeData.style === "Possession") {
            suggestedMarket = "Over 5.5 Corners"; // Or Home Win
            reasoning = `${home} dominates possession, leading to high corner counts.`;
        } else {
            suggestedMarket = "Home Win";
            reasoning = `${home} has a significant class advantage over ${away}.`;
        }
    } else if (awayData.tier < homeData.tier) {
        // Away is Stronger
        suggestedMarket = "Away Win"; // Or Double Chance X2
        reasoning = `${away} is the stronger side even away from home.`;
    } else {
        // Equal Tiers
        suggestedMarket = "Double Chance 1X"; // Safe bet
        if (homeData.style === "Aggressive" && awayData.style === "Aggressive") {
            suggestedMarket = "Over 2.5 Goals";
            reasoning = "Two attacking teams clashing usually implies goals.";
        }
    }

    return {
        h2h: generateH2H(home, away),
        homeForm: generateForm(homeData.tier),
        awayForm: generateForm(awayData.tier),
        homeStyle: homeData.style,
        awayStyle: awayData.style,
        suggestedMarket,
        suggestedReasoning: reasoning
    };
};
