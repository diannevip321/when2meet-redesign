// src/components/CreateEvent.tsx

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Autocomplete from "@mui/material/Autocomplete";
import dayjs, { Dayjs } from "dayjs";

const timeZoneList = [
  "UTC",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Australia/Sydney",
  // …add more as needed
];

const CreateEvent: React.FC = () => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [startTime, setStartTime] = useState<Dayjs | null>(
    dayjs().hour(9).minute(0)
  );
  const [endTime, setEndTime] = useState<Dayjs | null>(
    dayjs().hour(17).minute(0)
  );
  const [tz, setTz] = useState<string>(timeZoneList[1]); // America/New_York
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Event name is required.");
    if (!startDate || !endDate) return setError("Both dates are required.");
    if (endDate.isBefore(startDate, "day"))
      return setError("End date must be on/after start.");
    if (!startTime || !endTime) return setError("Both times are required.");
    if (!endTime.isAfter(startTime))
      return setError("End time must be after start.");

    setLoading(true);
    setTimeout(() => {
      console.log({
        name,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
        startTime: startTime.format("HH:mm"),
        endTime: endTime.format("HH:mm"),
        tz,
      });
      setLoading(false);
      // TODO: navigate to next screen or show success
    }, 1500);
  };

  const resetForm = () => {
    setName("");
    setStartDate(dayjs());
    setEndDate(dayjs());
    setStartTime(dayjs().hour(9).minute(0));
    setEndTime(dayjs().hour(17).minute(0));
    setTz(timeZoneList[1]);
    setError("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #5B0EED 0%, #2575fc 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{ width: 430, p: 4, borderRadius: 2, textAlign: "center" }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Create Event
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Set up dates & times for your meeting
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2, fontSize: "0.9rem" }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          {/* Event Name */}
          <TextField
            label="Event Name"
            required
            InputLabelProps={{ required: true }}
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* When? */}
          <Typography
            variant="h6"
            sx={{ mt: 3, mb: 1, textAlign: "left" }}
          >
            When?
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(d) => setStartDate(d)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(d) => setEndDate(d)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* At What Times? */}
            <Typography
              variant="h6"
              sx={{ mt: 3, mb: 1, textAlign: "left" }}
            >
              At What Times?
            </Typography>

            <TimePicker
              label="Earliest Time"
              value={startTime}
              onChange={(d) => setStartTime(d)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <TimePicker
              label="Latest Time"
              value={endTime}
              onChange={(d) => setEndTime(d)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </LocalizationProvider>

          {/* Time Zone */}
          <Autocomplete
            options={timeZoneList}
            value={tz}
            onChange={(_, v) => v && setTz(v)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Time Zone"
                required
                InputLabelProps={{ required: true }}
                margin="normal"
                fullWidth
              />
            )}
          />

          {/* Actions */}
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
          >
            <Button variant="outlined" onClick={resetForm}>
              Reset
            </Button>
            <Button variant="contained" type="submit" disabled={loading}>
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create"
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateEvent;
