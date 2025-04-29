import React, { useState } from "react";
import { 
  Container, TextField, Button, Typography, Checkbox, 
  FormControlLabel, Paper, Box, CircularProgress 
} from "@mui/material";

const SignIn: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // clear previous errors

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!password.trim()) {
        setError("Password is required.");
        return;
    }

    setLoading(true);

    // Simulate API call or backend response time
    setTimeout(() => {
      console.log("User:", name, "Password:", password, "New User:", isNewUser);
      setLoading(false);
    }, 1500);
  };

  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh", 
        background: "linear-gradient(135deg, #5B0EED 0%, #2575fc 100%)",
        padding: "2rem"
      }}
    >
      {/* Top Instruction */}
      <Typography 
        variant="h6" 
        color="white" 
        sx={{ 
          marginBottom: "2rem", 
          textAlign: "center", 
          maxWidth: "550px", 
          fontSize: "1.1rem",
          fontWeight: 500,
          lineHeight: "1.4",
        }}
      >
        To invite people to this event, you can 
        <a href="#" style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}> email them</a>, 
        send a 
        <a href="#" style={{ color: "#FFD700", textDecoration: "none", fontWeight: "bold" }}> Facebook message</a>, 
        or share this link.
      </Typography>

      {/* Sign-In Card */}
      <Paper 
        elevation={10} 
        sx={{ 
          padding: "3rem", 
          width: "430px", 
          textAlign: "center", 
          borderRadius: "12px",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)", 
          backgroundColor: "white"
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: "2rem" }}>
          Welcome to When2Meet
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{ fontSize: "1rem" }}>
          Sign in to continue scheduling
        </Typography>

        {/* Error message */}
        {error && (
          <Typography color="error" sx={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSignIn}>
          <TextField
            label="Enter Your Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label="Password *"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Checkbox */}
          <FormControlLabel
            control={<Checkbox checked={isNewUser} onChange={() => setIsNewUser(!isNewUser)} />}
            label={<Typography fontWeight="bold" fontSize="1rem">New to this event?</Typography>}
            sx={{ marginBottom: "1rem" }}
          />

          {/* Sign-In Button */}
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            sx={{ 
              marginTop: "1rem", 
              padding: "0.75rem", 
              fontSize: "1rem", 
              fontWeight: "bold",
              backgroundColor: "#5B0EED",
              transition: "all 0.3s ease-in-out",
              "&:hover": { backgroundColor: "#3E0DC5", transform: "scale(1.05)" },
              "&:active": { transform: "scale(0.95)" }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>
        </form>

        {/* Footer */}
        <Typography 
          variant="body2" 
          color="textSecondary" 
          sx={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", lineHeight: "1.5" }}
        >
          Name/Password are only for this event. <br />
          New to this event? Make up a password. <br />
          Returning? Use the same name/password.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignIn;
