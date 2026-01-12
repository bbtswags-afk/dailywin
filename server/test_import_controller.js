
import { getPredictions, getLive } from './src/controllers/predictionController.js';

if (typeof getPredictions === 'function' && typeof getLive === 'function') {
    console.log("✅ predictionController exports both functions successfully");
} else {
    console.error("❌ Missing exports in predictionController");
    process.exit(1);
}
