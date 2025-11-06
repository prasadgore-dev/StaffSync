// import { useState } from 'react';
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Grid,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   TextField,
// } from '@mui/material';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { managerApi } from '../../services/api';

// type ReportType = 'hours' | 'overtime' | 'absences' | 'exceptions';

// interface ReportFilters {
//   startDate: Date | null;
//   endDate: Date | null;
//   department?: string;
//   reportType: ReportType;
// }

// export const ReportsPage = () => {
//   const [filters, setFilters] = useState<ReportFilters>({
//     startDate: null,
//     endDate: null,
//     reportType: 'hours'
//   });

//   const handleGenerateReport = async () => {
//     try {
//       // Call API to generate report based on filters
//       const response = await managerApi.generateReport(filters);
//       // Handle the report data (e.g., download PDF, display in table, etc.)
//       console.log('Report generated:', response);
//     } catch (error) {
//       console.error('Error generating report:', error);
//     }
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h4" gutterBottom>
//         Reports
//       </Typography>

//       <Card sx={{ mb: 4 }}>
//         <CardContent>
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={3}>
//               <FormControl fullWidth>
//                 <InputLabel>Report Type</InputLabel>
//                 <Select
//                   value={filters.reportType}
//                   label="Report Type"
//                   onChange={(e) => setFilters({ ...filters, reportType: e.target.value as ReportType })}
//                 >
//                   <MenuItem value="hours">Total Hours Worked</MenuItem>
//                   <MenuItem value="overtime">Overtime Report</MenuItem>
//                   <MenuItem value="absences">Absence Report</MenuItem>
//                   <MenuItem value="exceptions">Exceptions Report</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
            
//             <Grid item xs={12} md={3}>
//               <DatePicker
//                 label="Start Date"
//                 value={filters.startDate}
//                 onChange={(date) => setFilters({ ...filters, startDate: date })}
//                 sx={{ width: '100%' }}
//               />
//             </Grid>
            
//             <Grid item xs={12} md={3}>
//               <DatePicker
//                 label="End Date"
//                 value={filters.endDate}
//                 onChange={(date) => setFilters({ ...filters, endDate: date })}
//                 sx={{ width: '100%' }}
//               />
//             </Grid>
            
//             <Grid item xs={12} md={3}>
//               <TextField
//                 fullWidth
//                 label="Department (Optional)"
//                 onChange={(e) => setFilters({ ...filters, department: e.target.value })}
//               />
//             </Grid>

//             <Grid item xs={12}>
//               <Button
//                 variant="contained"
//                 onClick={handleGenerateReport}
//                 disabled={!filters.startDate || !filters.endDate}
//               >
//                 Generate Report
//               </Button>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>

//       {/* Report preview area will go here */}
//       <Box sx={{ mt: 4 }}>
//         <Typography variant="h6" gutterBottom>
//           Report Preview
//         </Typography>
//         {/* Add table or visualization component here */}
//       </Box>
//     </Box>
//   );
// };