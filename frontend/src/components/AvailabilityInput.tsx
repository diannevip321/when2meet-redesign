// src/components/AvailabilityInput.tsx

import React, { useState, useMemo, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";

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
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  InputAdornment,
  TextField
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface Interval {
  day: string;       // "Mon" | … | "Sun"
  startMin: number;  // minutes from midnight
  endMin: number;    // exclusive
}

const DAYS_OF_WEEK = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const SLOT_MIN = 30;          // 30-minute grid
const EARLIEST = 9*60;        // 9:00am
const LATEST   = 18*60+15;    // 6:15pm

const AvailabilityInput: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [selectedMap, setSelectedMap] = useState<Record<string,Set<number>>>({});

  // Form state
  const [formDay, setFormDay]     = useState(DAYS_OF_WEEK[0]);
  const [formStart, setFormStart] = useState<Dayjs>(dayjs().hour(9).minute(0));
  const [formEnd,   setFormEnd]   = useState<Dayjs>(dayjs().hour(10).minute(0));
  const [error,     setError]     = useState("");

  // Rebuild selectedMap from intervals
  useEffect(() => {
    const map: Record<string,Set<number>> = {};
    intervals.forEach(({day,startMin,endMin}) => {
      if (!map[day]) map[day] = new Set();
      for (let m = startMin; m < endMin; m += SLOT_MIN) {
        map[day].add(m);
      }
    });
    setSelectedMap(map);
  }, [intervals]);

  // Toggle one cell and re-chunk into intervals
  const toggleCell = (day:string, m:number) => {
    setError("");
    const nm = {...selectedMap};
    if (!nm[day]) nm[day] = new Set();
    if (nm[day].has(m)) nm[day].delete(m);
    else nm[day].add(m);

    const next:Interval[] = [];
    Object.entries(nm).forEach(([d,setM]) => {
      const arr = Array.from(setM).sort((a,b)=>a-b);
      let start = arr[0], prev = start;
      for (let i=1; i<=arr.length; i++) {
        if (i===arr.length || arr[i]!==prev+SLOT_MIN) {
          next.push({day:d, startMin:start, endMin:prev+SLOT_MIN});
          if (i< arr.length) {
            start = arr[i];
            prev = start;
          }
        } else prev = arr[i];
      }
    });
    setIntervals(next);
  };

  // Mouse‐drag painting
  const [dragVal, setDragVal] = useState<boolean|null>(null);
  useEffect(()=>{
    const up = ()=>setDragVal(null);
    document.addEventListener("mouseup",up);
    return ()=>document.removeEventListener("mouseup",up);
  },[]);
  const handleDown = (d:string,m:number)=>{
    const cur = selectedMap[d]?.has(m)??false;
    setDragVal(!cur);
    toggleCell(d,m);
  };
  const handleEnter = (d:string,m:number)=>{
    if (dragVal!==null && (selectedMap[d]?.has(m)??false)!==dragVal) {
      toggleCell(d,m);
    }
  };

  // Hour groups for splitting each hour into two rows
  const slotGroups = useMemo(()=>{
    const groups:{hour:number; minutes:number[]}[] = [];
    for (let h=EARLIEST/60; h< LATEST/60; h++){
      groups.push({ hour:h, minutes:[h*60, h*60+30] });
    }
    return groups;
  },[]);

  // Add via form
  const addInterval = () => {
    setError("");
    const sd = formStart.hour()*60 + formStart.minute();
    const ed = formEnd.hour()*60   + formEnd.minute();
    if (ed<=sd) { setError("End must be after start"); return; }

    // snap to grid
    const as = Math.floor(sd/SLOT_MIN)*SLOT_MIN;
    const ae = Math.ceil(ed/SLOT_MIN)*SLOT_MIN;

    if (intervals.some(i=>
      i.day===formDay && !(ae<=i.startMin||as>=i.endMin)
    )) {
      setError("Overlaps existing"); return;
    }
    setIntervals([...intervals, {day:formDay, startMin:as, endMin:ae}]);
  };

  // Remove one
  const removeInterval = (idx:number)=>{
    setError("");
    setIntervals(intervals.filter((_,i)=>i!==idx));
  };

  return (
    <Box sx={{
      minHeight:"100vh",
      display:"flex",
      alignItems:"top",
      justifyContent:"center",
      background:"linear-gradient(135deg,#5B0EED 0%,#2575fc 100%)",
      p:2
    }}>
      <Paper elevation={10} sx={{width:600,p:4,borderRadius:2, textAlign:"center"}}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Your Availability
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Click or drag any half-hour cell to toggle.
        </Typography>

        <Tabs
          value={tab}
          onChange={(_,v)=>setTab(v)}
          textColor="primary"
          indicatorColor="primary"
          centered
          sx={{mb:3}}
        >
          <Tab label="Grid View"/>
          <Tab label="Form View"/>
        </Tabs>

        {tab===0 ? (
          <>
            <Box sx={{display:"flex",justifyContent:"center",mb:1,alignItems:"center"}}>
              <Box sx={{w:20,h:20,border:1,borderColor:"grey.500",mr:1}}/>
              <Typography variant="body2" mr={2}>Unavailable</Typography>
              <Box sx={{w:20,h:20,bgcolor:"success.light",mr:1}}/>
              <Typography variant="body2">Available</Typography>
            </Box>

            <TableContainer sx={{maxHeight:400}}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    {DAYS_OF_WEEK.map(d=>
                      <TableCell key={d} align="center">{d}</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slotGroups.map(({hour,minutes})=>(
                    <React.Fragment key={hour}>
                      <TableRow hover>
                        <TableCell rowSpan={2} sx={{fontWeight:"bold"}}>
                          {dayjs().hour(hour).minute(0).format("h:mm A")}
                        </TableCell>
                        {DAYS_OF_WEEK.map(d=>{
                          const m=minutes[0];
                          const av=selectedMap[d]?.has(m)??false;
                          return (
                            <TableCell
                              key={d+"-"+m}
                              onMouseDown={()=>handleDown(d,m)}
                              onMouseEnter={()=>handleEnter(d,m)}
                              sx={{
                                bgcolor:av?"success.light":"grey.100",
                                cursor:"pointer",
                                p:0,
                                height:32
                              }}
                            />
                          );
                        })}
                      </TableRow>
                      <TableRow hover>
                        {DAYS_OF_WEEK.map(d=>{
                          const m=minutes[1];
                          const av=selectedMap[d]?.has(m)??false;
                          return (
                            <TableCell
                              key={d+"-"+m}
                              onMouseDown={()=>handleDown(d,m)}
                              onMouseEnter={()=>handleEnter(d,m)}
                              sx={{
                                bgcolor:av?"success.light":"grey.100",
                                cursor:"pointer",
                                p:0,
                                height:32
                              }}
                            />
                          );
                        })}
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Day</InputLabel>
              <Select
                label="Day"
                value={formDay}
                onChange={e=>setFormDay(e.target.value)}
              >
                {DAYS_OF_WEEK.map(d=>
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                )}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Start Time"
                value={formStart}
                onChange={v=>v&&setFormStart(v)}
                views={["hours","minutes"]}
                minutesStep={15}
                ampm
                renderInput={params=>(
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment:(
                        <InputAdornment position="start">
                          <AccessTimeIcon color="action"/>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
              <TimePicker
                label="End Time"
                value={formEnd}
                onChange={v=>v&&setFormEnd(v)}
                views={["hours","minutes"]}
                minutesStep={15}
                ampm
                renderInput={params=>(
                  <TextField
                    {...params}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment:(
                        <InputAdornment position="start">
                          <AccessTimeIcon color="action"/>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            {error && (
              <Typography color="error" sx={{mt:1}}>{error}</Typography>
            )}
            <Box sx={{textAlign:"right",mt:2}}>
              <Button variant="contained" onClick={addInterval}>
                Add Interval
              </Button>
            </Box>

            <List dense sx={{mt:2}}>
              {intervals.map((intv,i)=>(
                <ListItem key={i} divider>
                  <ListItemText
                    primary={`${intv.day}: `+
                      `${dayjs().hour(0).minute(intv.startMin).format("h:mm A")} – `+
                      `${dayjs().hour(0).minute(intv.endMin).format("h:mm A")}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={()=>removeInterval(i)}>
                      <DeleteIcon/>
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AvailabilityInput;
