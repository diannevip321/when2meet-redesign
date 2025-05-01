// src/components/GroupAvailability.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import dayjs from "dayjs";

// configuration
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const USERS = ["Alice","Bob","Carol","Dave","Eve"];
const TOTAL = USERS.length;
const SLOT_MIN = 30;            // 30-minute granularity
const EARLIEST = 9 * 60;        //  9:00 AM
const LATEST   = 18 * 60 + 15;  //  6:15 PM

// sample availability data: user → dayIndex → set of minute offsets
const sampleAvailability: Record<string, Record<number, Set<number>>> = {
  Alice: { 0: new Set([540,570,600]), 2: new Set([600,630]),   4: new Set([540,570]) },
  Bob:   { 0: new Set([540,570]),       1: new Set([630,660]),   4: new Set([600,630]) },
  Carol: { 0: new Set([540]),           2: new Set([600,630,660]),  3: new Set([540,570,600]) },
  Dave:  { 1: new Set([540,570,600]),   2: new Set([600,630]),     4: new Set([540,570,600]) },
  Eve:   { 0: new Set([540,570,600]),   3: new Set([600,630]),     5: new Set([540,570,600]) },
};

const GroupAvailability: React.FC = () => {
  const theme = useTheme();

  // build a map dayIndex → slot → list of avail users
  const countMap = useMemo(() => {
    const m: Record<number, Record<number, string[]>> = {};
    for (let di = 0; di < 7; di++) {
      m[di] = {};
      for (let t = EARLIEST; t <= LATEST; t += SLOT_MIN) {
        m[di][t] = USERS.filter(u => sampleAvailability[u]?.[di]?.has(t));
      }
    }
    return m;
  }, []);

  // build array of all slot times
  const slots = useMemo(() => {
    const out: number[] = [];
    for (let t = EARLIEST; t <= LATEST; t += SLOT_MIN) out.push(t);
    return out;
  }, []);

  // UI state
  const [viewTab, setViewTab]     = useState<0|1>(0);
  const [filterMin, setFilterMin] = useState(0);

  // color helper: success green with varying alpha
  const getCellColor = (count: number) =>
    alpha(theme.palette.success.main, 0.1 + 0.7 * (count / TOTAL));

  // --- prepare grouped intervals for List view ---
  const grouped = useMemo(() => {
    type G = { day: number; start: number; end: number; users: string[] };
    const out: G[] = [];

    for (let di = 0; di < 7; di++) {
      // gather only slots meeting the filter
      const items = slots
        .map(t => ({
          t,
          users: countMap[di][t].slice().sort()
        }))
        .filter(x => x.users.length >= filterMin);

      if (!items.length) continue;

      // group contiguous slots that have the **same exact** user list
      let grp = items[0];
      for (let i = 1; i <= items.length; i++) {
        const curr = items[i];
        const sameUsers = curr && 
          JSON.stringify(curr.users) === JSON.stringify(grp.users);
        const contiguous = curr && curr.t === grp.t + SLOT_MIN;

        if (curr && sameUsers && contiguous) {
          // extend group
          grp = { ...grp };
          grp.t = curr.t; // track end
        } else {
          // push completed group: start at grp.t_start, end = grp.t + SLOT_MIN
          out.push({
            day: di,
            start: items[i-1 - (sameUsers && contiguous ? 1 : 0)].t,
            end: grp.t + SLOT_MIN,
            users: grp.users
          });
          if (curr) grp = curr;
        }
      }
    }
    return out;
  }, [countMap, slots, filterMin]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex", 
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #5B0EED 0%, #2575fc 100%)",
        p:2,
      }}
    >
      <Paper
        elevation={10}
        sx={{ width:"90%", maxWidth:1000, p:4, borderRadius:2 }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Group Availability
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Hover for names; click a cell to select a slot.
        </Typography>

        {/* Tabs + Filter */}
        <Box sx={{ display:"flex", alignItems:"center", mb:2 }}>
          <Tabs
            value={viewTab}
            onChange={(_,v)=>setViewTab(v as 0|1)}
            sx={{ flexGrow:1 }}
          >
            <Tab label="Grid View" />
            <Tab label="List View" />
          </Tabs>

          <FormControl size="small" sx={{ width:140 }}>
            <InputLabel>At least</InputLabel>
            <Select
              label="At least"
              value={filterMin}
              onChange={e=>setFilterMin(Number(e.target.value))}
            >
              <MenuItem value={0}>All</MenuItem>
              {[1,2,3,4,5].map(n=>(
                <MenuItem key={n} value={n}>{`${n} people`}</MenuItem>
              ))}
            </Select>
            <FormHelperText>show slots with ≥ N</FormHelperText>
          </FormControl>
        </Box>

        {viewTab === 0 ? (
          /* -------- GRID VIEW -------- */
          <TableContainer sx={{ maxHeight:400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Time</strong></TableCell>
                  {DAYS.map(d=>
                    <TableCell key={d} align="center"><strong>{d}</strong></TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {slots.map(t=>{
                  // skip row if none meet filter
                  const counts = DAYS.map((_,di)=>countMap[di][t].length);
                  if (Math.max(...counts) < filterMin) return null;

                  return (
                    <TableRow key={t} hover>
                      <TableCell sx={{ whiteSpace:"nowrap" }}>
                        {dayjs().hour(0).minute(t).format("h:mm A")}
                      </TableCell>
                      {DAYS.map((_,di)=>{
                        const users = countMap[di][t];
                        if (users.length < filterMin) {
                          return <TableCell key={di+"-"+t} />;
                        }
                        return (
                          <Tooltip
                            key={di+"-"+t}
                            title={users.join(", ")}
                            arrow
                          >
                            <TableCell
                              sx={{
                                bgcolor: getCellColor(users.length),
                                cursor: "pointer",
                                height: 32
                              }}
                              onClick={()=>{/* your select logic */}}
                            />
                          </Tooltip>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          /* ------- LIST VIEW ------- */
          <List
            sx={{ maxHeight:400, overflowY:"auto" }}
            subheader={
              <ListSubheader sx={{ bgcolor:"transparent" }}>
                Showing slots with ≥ {filterMin} people
              </ListSubheader>
            }
          >
            {grouped.map((g,i)=>(
              <ListItem key={i} divider>
                <ListItemText
                  primary={`${DAYS[g.day]} – ` +
                           `${dayjs().minute(g.start).format("h:mm A")} ` +
                           `to ${dayjs().minute(g.end).format("h:mm A")}`}
                  secondary={g.users.join(", ")}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default GroupAvailability;
