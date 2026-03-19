import crypto from "crypto";

interface ResetPasswordToken {
  resetToken: string;
  hashedToken: string;
  resetPasswordExpireTime: number;
}

export const generateResetPasswordToken = (): ResetPasswordToken => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetPasswordExpireTime = Date.now() + 15 * 60 * 1000;
  return { resetToken, hashedToken, resetPasswordExpireTime };
};
