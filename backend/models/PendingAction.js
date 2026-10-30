import mongoose from "mongoose";

// WHAT: AI ne jo kaam "propose" kiya, wo confirm hone tak yahan pada rehta hai.
// WHY: AI seedha JobApplication me nahi likhta. Beech me ye "parking area" hai.
const pendingActionSchema = new mongoose.Schema(
  {
    // kiska proposal hai (confirm ke time isi se ownership check hoga)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // WHY enum: sirf allowlist wale action chal sakte hain, aage naye types yahin jodna
    type: { type: String, enum: ["add_application"], required: true },

    // validated data jo confirm par save hoga (backend ne banaya, AI ne nahi)
    payload: { type: mongoose.Schema.Types.Mixed, required: true },

    // pending -> confirmed/cancelled/expired. Ek baar badla to dobara execute nahi hoga
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "expired"],
      default: "pending",
    },

    // WHY expiry: purana proposal kal ko confirm hokar chupke se save na ho jaye
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("PendingAction", pendingActionSchema);