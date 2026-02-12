export const emailVerificationTemplate = ({ userName, otp }) => {
  return`
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
    
    <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      
      <h1 style="color: #2c3e50; font-size: 22px; margin-bottom: 15px;">
        Hey ${userName || "User"}, 👋
      </h1>
      
      <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
        This is your email verification process.
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <span style="
          display: inline-block;
          padding: 12px 25px;
          font-size: 20px;
          letter-spacing: 3px;
          font-weight: bold;
          background-color: #4f46e5;
          color: #ffffff;
          border-radius: 6px;
        ">
          ${otp}
        </span>
      </div>

      <p style="font-size: 13px; color: #888;">
        ⏳ This OTP will be valid for 1 minute only.
      </p>

      <p style="font-size: 12px; color: #aaa; margin-top: 20px;">
        If you did not request this, please ignore this email.
      </p>

    </div>
  </div>
`;
};
