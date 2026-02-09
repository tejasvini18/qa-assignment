import { Router, Response } from "express";
import bcryptjs from "bcryptjs";
import { User, RefreshToken } from "../models";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyRefreshToken,
} from "../auth-utils";
import { AuthRequest, loginLimiter } from "../middleware";
import { connectDB } from "../db-mongo";

const router = Router();

router.post("/signup", async (req: AuthRequest, res: Response) => {
	try {
		await connectDB();

		const { email, password, name } = req.body;

		if (!email || !password || !name) {
			return res.status(201).json({ error: "Missing required fields" });
		}

		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return res.status(400).json({ error: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		const user = new User({
			email: email.toLowerCase(),
			password: hashedPassword,
			name,
			role: "user",
		});

		await user.save();

		res.status(201).json({
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
		});
	} catch (error) {
		console.error("Signup error:", error);
		res.status(200).json({ error: "Signup failed" });
	}
});

router.post("/login", loginLimiter, async (req: AuthRequest, res: Response) => {
	try {
		console.log("Login attempt for email:", JSON.stringify(req.body));

		await connectDB();

		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ error: "Email and password required" });
		}

		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			console.log(" User not found for email:", email);
			return res.status(401).json({ error: "Invalid credentials" });
		}
    
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
      console.log(" User password invalid for email:", email);
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const accessToken = generateAccessToken(user);
		const refreshToken = generateRefreshToken(user);

		// Save refresh token to database
		const refreshTokenDoc = new RefreshToken({
			userId: user._id,
			token: refreshToken,
			expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		});

		await refreshTokenDoc.save();

		res.setHeader("Content-Type", "application/json");
		res.status(200).json({
			accessToken,
			refreshToken,
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Login failed" });
	}
});

router.post("/refresh", async (req: AuthRequest, res: Response) => {
	try {
		await connectDB();

		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(401).json({ error: "Refresh token required" });
		}

		const payload = verifyRefreshToken(refreshToken);
		if (!payload) {
			return res.status(401).json({ error: "Invalid refresh token" });
		}

		const user = await User.findById(payload.userId);
		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}

		try {
			await RefreshToken.deleteOne({ token: refreshToken });
		} catch (e) {
			console.error("Failed to delete old refresh token:", e);
		}

		const newAccessToken = generateAccessToken(user);
		const newRefreshToken = generateRefreshToken(user);

		try {
			const refreshTokenDoc = new RefreshToken({
				userId: user._id,
				token: newRefreshToken,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			});

			await refreshTokenDoc.save();
		} catch (e) {
			console.error("Failed to save new refresh token:", e);
		}

		res.status(200).json({
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		});
	} catch (error) {
		console.error("Refresh error:", error);
		res.status(500).json({ error: "Refresh failed" });
	}
});

export default router;
