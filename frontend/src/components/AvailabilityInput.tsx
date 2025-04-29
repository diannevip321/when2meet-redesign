// src/components/AvailabilityInput.tsx
import React, { useState, useRef } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
  alpha,
  TextField
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 9 }, (_, i) => 9 + i); // 9–17h

type SlotKey = `${number}-${number}`; // "dayIdx-hour"

export default function AvailabilityInput() {
  const theme = useTheme();
  // store cell-wise availability
  const [avail, setAvail] = useState<Record<SlotKey, boolean>>({});
  // history for undo
  const [history, setHistory] = useState<Record<SlotKey, boolean>[]>([]);
  // dragging state for grid
  const dragging = useRef(false);
  // tab index: 0 = Grid, 1 = Form
  const [tab, setTab] = useState(0);

  // form-mode state: chosen day & times
  const [formDay, setFormDay] = useState<number>(0);
  const [formStart, setFormStart] = useState<Dayjs>(dayjs().hour(9).minute(0));
  const [formEnd, setFormEnd] = useState<Dayjs>(dayjs().hour(10).minute(0));
  // list of ranges to display
  const [ranges, setRanges] = useState<
    { day: number; start: Dayjs; end: Dayjs }[]
  >([]);

  // common helpers
  const recordHistory = () => setHistory(h => [...h, { ...avail }]);
  const toggleCell = (key: SlotKey) => {
    recordHistory();
    setAvail(a => ({ ...a, [key]: !a[key] }));
  };

  // grid handlers
  const handleMouseDown = (key: SlotKey) => {
    dragging.current = true;
    toggleCell(key);
  };
  const handleMouseOver = (key: SlotKey) => {
    if (dragging.current) toggleCell(key);
  };
  const handleMouseUp = () => {
    dragging.current = false;
  };
  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setAvail(prev);
  };

  // form handlers
  const addRange = () => {
    if (formEnd.isAfter(formStart)) {
      setRanges(r => [...r, { day: formDay, start: formStart, end: formEnd }]);
      // also mark in the grid
      recordHistory();
      const newAvail = { ...avail };
      for (let h = formStart.hour(); h < formEnd.hour(); h++) {
        const key = `${formDay}-${h}` as SlotKey;
        newAvail[key] = true;
      }
      setAvail(newAvail);
    }
  };
  const removeRange = (idx: number) => {
    recordHistory();
    const rem = ranges[idx];
    setRanges(r => r.filter((_, i) => i !== idx));
    const newAvail = { ...avail };
    for (let h = rem.start.hour(); h < rem.end.hour(); h++) {
      const key = `${rem.day}-${h}` as SlotKey;
      newAvail[key] = false;
    }
    setAvail(newAvail);
  };

  return (
    <Box onMouseUp={handleMouseUp} sx={{ p: 2, minHeight: "100vh", background: "linear-gradient(135deg, #5B0EED 0%, #2575fc 100%)" }}>
      <Paper sx={{ maxWidth: 760, m: "auto", p: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Your Availability
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{ mb: 2 }}
        >
          <Tab label="Grid View" />
          <Tab label="Form View" />
        </Tabs>

        {tab === 0 ? (
          // ——— GRID MODE ———
          <>
            <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
              <LegendBadge color={theme.palette.grey[200]!} label="Unavailable" />
              <LegendBadge color={alpha(theme.palette.primary.main, 0.3)} label="Available" />
              <Box flexGrow={1} />
              <Button onClick={undo} disabled={!history.length} size="small">Undo</Button>
            </Box>

            <TableContainer>
              <Table size="small" sx={{ borderCollapse: "collapse" }}>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    {days.map(d => (
                      <TableCell key={d} align="center">{d}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hours.map((hour, r) => (
                    <TableRow
                      key={hour}
                      sx={{ backgroundColor: r % 2 ? theme.palette.grey[50] : "inherit" }}
                    >
                      <TableCell sx={{ fontWeight: "bold" }}>{`${hour}:00`}</TableCell>
                      {days.map((_, c) => {
                        const key = `${c}-${hour}` as SlotKey;
                        const filled = !!avail[key];
                        return (
                          <TableCell
                            key={key}
                            onMouseDown={() => handleMouseDown(key)}
                            onMouseOver={() => handleMouseOver(key)}
                            tabIndex={0}
                            aria-pressed={filled}
                            onKeyDown={e => {
                              if (e.key === " " || e.key === "Enter") {
                                e.preventDefault();
                                toggleCell(key);
                              }
                            }}
                            sx={{
                              width: 60, height: 40,
                              bgcolor: filled ? alpha(theme.palette.primary.main, 0.3) : theme.palette.grey[200],
                              border: 1, borderColor: theme.palette.divider,
                              cursor: "pointer",
                              transition: "0.2s",
                              "&:hover": {
                                bgcolor: filled
                                  ? alpha(theme.palette.primary.main, 0.5)
                                  : alpha(theme.palette.grey[200], 0.7),
                              },
                              "&:focus": {
                                outline: `2px solid ${theme.palette.primary.main}`,
                              },
                            }}
                          />
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          // ——— FORM MODE ———
          <>
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Day</InputLabel>
                <Select
                  value={formDay}
                  label="Day"
                  onChange={e => setFormDay(Number(e.target.value))}
                >
                  {days.map((d, i) => (
                    <MenuItem key={d} value={i}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Start"
                  value={formStart}
                  onChange={v => v && setFormStart(v)}
                  renderInput={params => <TextField {...params} />}
                />
                <TimePicker
                  label="End"
                  value={formEnd}
                  onChange={v => v && setFormEnd(v)}
                  renderInput={params => <TextField {...params} />}
                />
              </LocalizationProvider>

              <Button variant="contained" onClick={addRange} sx={{ alignSelf: "center" }}>
                Add
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <List dense>
              {ranges.map((r, i) => (
                <ListItem
                  key={i}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => removeRange(i)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`${days[r.day]}: ${r.start.format("HH:mm")} – ${r.end.format("HH:mm")}`}
                  />
                </ListItem>
              ))}
              {!ranges.length && (
                <Typography color="textSecondary" align="center">
                  No ranges added yet.
                </Typography>
              )}
            </List>
          </>
        )}
      </Paper>
    </Box>
  );
}

// small helper for legend
function LegendBadge({ color, label }: { color: string; label: string }) {
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Box
        sx={{
          width: 20,
          height: 20,
          bgcolor: color,
          border: 1,
          borderColor: "divider",
        }}
      />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}
