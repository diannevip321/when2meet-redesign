// src/components/GroupAvailability.tsx

import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  useTheme,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TOTAL = 5;
const NAMES = ["Alice", "Bob", "Carol", "Dave", "Eve"];

// sample availability with 5/5 and 4/5 slots built in
const SAMPLE: Record<string, { day: number; start: number; end: number }[]> = {
  Alice: [
    { day: 0, start: 9 * 60, end: 11 * 60 + 30 },
    { day: 2, start: 10 * 60, end: 12 * 60 },
    { day: 0, start: 11 * 60, end: 11 * 60 + 30 },
    { day: 4, start: 9 * 60, end: 9 * 60 + 30 },
  ],
  Bob: [
    { day: 0, start: 9 * 60 + 30, end: 12 * 60 },
    { day: 4, start: 13 * 60, end: 15 * 60 + 30 },
    { day: 0, start: 11 * 60, end: 11 * 60 + 30 },
    { day: 4, start: 9 * 60, end: 9 * 60 + 30 },
  ],
  Carol: [
    { day: 1, start: 14 * 60, end: 16 * 60 },
    { day: 2, start: 10 * 60, end: 11 * 60 + 30 },
    { day: 4, start: 9 * 60, end: 9 * 60 + 30 },
  ],
  Dave: [
    { day: 2, start: 9 * 60, end: 10 * 60 + 30 },
    { day: 3, start: 15 * 60, end: 17 * 60 },
    { day: 0, start: 11 * 60, end: 11 * 60 + 30 },
    { day: 4, start: 9 * 60, end: 9 * 60 + 30 },
  ],
  Eve: [
    { day: 0, start: 11 * 60, end: 13 * 60 },
    { day: 4, start: 9 * 60, end: 9 * 60 + 30 },
  ],
};

const GroupAvailability: React.FC = () => {
  const theme = useTheme();

  // build half-hour slots from 9:00 to 18:15
  const slots = useMemo(() => {
    const arr: number[] = [];
    for (let m = 9 * 60; m <= 18 * 60 + 15; m += 30) arr.push(m);
    return arr;
  }, []);

  // countMap["day-slot"] = list of names available
  const countMap = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (let day = 0; day < 7; day++) {
      for (let slot of slots) {
        m[`${day}-${slot}`] = NAMES.filter((name) =>
          SAMPLE[name].some(
            (i) => i.day === day && slot >= i.start && slot < i.end
          )
        );
      }
    }
    return m;
  }, [slots]);

  const [view, setView] = useState<0 | 1>(0);
  const [minPeople, setMinPeople] = useState(1);

  // coalesce contiguous slots for list view
  const listData = useMemo(() => {
    type G = { day: number; start: number; end: number; users: string[] };
    const all: G[] = [];
    Object.entries(countMap)
      .filter(([, users]) => users.length >= minPeople)
      .map(([key, users]) => {
        const [d, s] = key.split("-").map(Number);
        return { day: d, start: s, users };
      })
      .sort((a, b) =>
        a.day === b.day ? a.start - b.start : a.day - b.day
      )
      .forEach(({ day, start, users }) => {
        const last = all[all.length - 1];
        const sameSet =
          last &&
          last.day === day &&
          start === last.end &&
          JSON.stringify(last.users.sort()) ===
            JSON.stringify(users.sort());
        if (sameSet) {
          last.end += 30;
        } else {
          all.push({ day, start, end: start + 30, users });
        }
      });
    return all;
  }, [countMap, minPeople]);

  // get a tinted green based on number available
  const getCellColor = (count: number) =>
    alpha(theme.palette.success.main, 0.4 + (count / TOTAL) * 0.6);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #5B0EED 0%, #2575fc 100%)",
      }}
    >
      <Paper elevation={10} sx={{ width: 800, maxWidth: "100%", p: 4, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Group Availability
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Hover any cell to see who’s available.
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Tabs
            value={view}
            onChange={(_, v) => setView(v as 0 | 1)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Grid View" />
            <Tab label="List View" />
          </Tabs>

          <FormControl size="small">
            <InputLabel>Min People</InputLabel>
            <Select
              label="Min People"
              value={minPeople}
              onChange={(e) => setMinPeople(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <MenuItem key={n} value={n}>
                  ≥ {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {view === 0 ? (
          // —— GRID VIEW —— 
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  {DAYS.map((d) => (
                    <TableCell key={d} align="center">{d}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot} hover>
                    <TableCell>
                      {dayjs().startOf("day").add(slot, "minute").format("h:mm A")}
                    </TableCell>
                    {DAYS.map((_, day) => {
                      const users = countMap[`${day}-${slot}`] || [];
                      const meets = users.length >= minPeople;
                      return (
                        <Tooltip
                          key={day + "-" + slot}
                          title={users.length ? users.join(", ") : "No one available"}
                        >
                          <TableCell
                            sx={{
                              bgcolor: meets ? getCellColor(users.length) : theme.palette.grey[100],
                              cursor: "pointer",
                              p: 0,
                              height: 32,
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // —— LIST VIEW —— 
          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            {listData.map((g, i) => {
              const ratio = g.users.length / TOTAL;
              const borderColor = alpha(theme.palette.success.main, 0.4 + ratio * 0.6);
              return (
                <Paper key={i} elevation={1} sx={{ display: "flex", alignItems: "center", borderLeft: `5px solid ${borderColor}`, p: 2, mb: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">
                      {DAYS[g.day]} — {dayjs().startOf("day").add(g.start, "minute").format("h:mm A")} to {dayjs().startOf("day").add(g.end, "minute").format("h:mm A")}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      {g.users.map((u) => (
                        <Chip key={u} label={u} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                  <Chip label={`${g.users.length}/${TOTAL}`} color="success" size="small" />
                </Paper>
              );
            })}
            {listData.length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", mt: 4 }}>
                No slots match your filter.
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default GroupAvailability;
