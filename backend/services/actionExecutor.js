import PendingAction from "../models/PendingAction.js";
import JobApplication from "../models/JobApplication.js";

// WHAT: har action type ka asli kaam. Ye allowlist hai: jo yahan nahi, wo chal hi nahi sakta.
const executors = {
  add_application: (userId, payload) =>
    JobApplication.create({
      user: userId, // JWT wali id, payload wali nahi
      companyName: payload.companyName,
      role: payload.role,
      location: payload.location,
      workMode: payload.workMode,
      appliedDate: payload.appliedDate,
      currentStatus: "applied",
      statusHistory: [
        { status: "applied", date: payload.appliedDate, note: "Added via AI assistant" },
      ],
    }),
};

export async function confirmPendingAction(userId, actionId) {
  // WHAT: "pending" ko "confirmed" me badalna aur check karna, ek hi atomic step me.
  // WHY filter me 4 cheezein:
  //   _id      -> wahi proposal
  //   user     -> dusre user ka proposal match hi nahi hoga
  //   status   -> double click ya replay par dobara execute nahi hoga
  //   expiresAt-> purana proposal nahi chalega
  const action = await PendingAction.findOneAndUpdate(
    { _id: actionId, user: userId, status: "pending", expiresAt: { $gt: new Date() } },
    { status: "confirmed" },
    { new: true }
  );

  if (!action) {
    return { ok: false, status: 404, message: "Proposal not found, already used, or expired." };
  }

  try {
    const data = await executors[action.type](userId, action.payload);
    return { ok: true, data };
  } catch (err) {
    // WHY revert: save fail hua to user dobara Confirm kar sake
    await PendingAction.updateOne({ _id: action._id }, { status: "pending" });
    throw err;
  }
}

export async function cancelPendingAction(userId, actionId) {
  const action = await PendingAction.findOneAndUpdate(
    { _id: actionId, user: userId, status: "pending" },
    { status: "cancelled" },
    { new: true }
  );
  return action
    ? { ok: true }
    : { ok: false, status: 404, message: "Proposal not found or already handled." };
}