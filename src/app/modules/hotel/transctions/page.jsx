"use client";
import * as React from "react";
import MainCard from "../../../components/MainCard";
import {
  Grid,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  Divider,
} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import Popover from "@mui/material/Popover";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { handleRoomInformation } from "../../../features/firestoreMultipleData";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  {
    id: "dateofTransction",
    numeric: false,
    disablePadding: true,
    label: "Date",
  },
  {
    id: "roomNo",
    numeric: true,
    disablePadding: true,
    label: "Room",
  },
  {
    id: "against",
    numeric: true,
    disablePadding: true,
    label: "Against",
  },
  {
    id: "attendant",
    numeric: false,
    disablePadding: false,
    label: "Attendant",
  },
  {
    id: "orderId",
    numeric: false,
    disablePadding: false,
    label: "Order Id.",
  },
  {
    id: "mode",
    numeric: false,
    disablePadding: false,
    label: "Mode",
  },
  {
    id: "paymentId",
    numeric: false,
    disablePadding: false,
    label: "Payment Id.",
  },
  {
    id: "txnTime",
    numeric: false,
    disablePadding: false,
    label: "Txn Time.",
  },
  {
    id: "discountCoupon",
    numeric: true,
    disablePadding: false,
    label: "Disc. Coupon",
  },
  {
    id: "discountPercentage",
    numeric: true,
    disablePadding: false,
    label: "Disc. %",
  },

  {
    id: "discount",
    numeric: true,
    disablePadding: false,
    label: "Discount",
  },

  {
    id: "amount",
    numeric: true,
    disablePadding: false,
    label: "Amount",
  },
  {
    id: "finalAmount",
    numeric: true,
    disablePadding: false,
    label: "Final Amount",
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "Status",
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function HotelTransction() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const dispatch = useDispatch();
  const info = useSelector((state) => state.firestoreMultipleData);
  const [transction, setTransction] = React.useState(null);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [filter, setFilter] = React.useState("");
  const [customFilter, setCustomFilter] = React.useState(dayjs(""));
  const [page, setPage] = React.useState(0);
  const [rows, setRows] = React.useState([]);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [anchorEl, setAnchorEl] = React.useState(null);

  React.useEffect(() => {
    if (status === "authenticated") {
      dispatch(
        handleRoomInformation({
          email: user.email,
        })
      );
    }
  }, [dispatch, user, status]);

  // if (status === "loading") return <div>Loading...</div>;
  // if (status === "failed") return <div>Error loading data</div>;
  React.useEffect(() => {
    if (info?.status === "succeeded") {
      const newRows = [];
      info.data.live.rooms.forEach((data) => {
        data.transctions.forEach((item) => {
          newRows.push(
            createData(
              new Date(item.payment.timeOfTransaction).toLocaleDateString(),
              item.location,
              item.against,
              item.attendant || "N/A",
              item.bookingId,
              item.payment.mode,
              item.payment.paymentId,
              new Date(item.payment.timeOfTransaction).toLocaleTimeString(),
              item.payment.discount.code,
              item.payment.discount.amount,
              item.payment.discount.type,
              item.payment.price,
              item.payment.priceAfterDiscount,
              item.payment.paymentStatus
            )
          );
        });
      });
      console.log(newRows);
      setTransction(info.data.live.rooms);
      setRows(newRows);
    }
  }, [info]);

  console.log("Transctions", transction);
  function createData(
    dateofTransction,
    roomNo,
    against,
    attendant,
    orderId,
    mode,
    paymentId,
    txnTime,
    discountCoupon,
    discountPercentage,
    discount,
    amount,
    finalAmount,
    status
  ) {
    return {
      dateofTransction,
      roomNo,
      against,
      attendant,
      orderId,
      mode,
      paymentId,
      txnTime,
      discountCoupon,
      discountPercentage,
      discount,
      amount,
      finalAmount,
      status,
    };
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows = React.useMemo(
    () =>
      [...rows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, rows]
  );
  console.log("first", visibleRows);
  const handleFilter = (filter) => {
    console.log(filter);
    setFilter(filter);
  };
  const handleCustomFilter = (filter) => {
    const formattedDate = dayjs(filter).format("MM/DD/YYYY");
    console.log(formattedDate);
    setCustomFilter(dayjs(filter));
  };

  return (
    <>
      {rows.length > 0 && (
        <MainCard
          sx={{
            backgroundColor: "#f2f2f2",
            padding: "0",
            ".css-1v9be3b-MuiCardContent-root": { padding: "10px" },
            overflowX: { xs: "auto", md: "auto" },
            whiteSpace: { xs: "nowrap", md: "nowrap" },
          }}
        >
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
              <Toolbar>
                <Typography
                  sx={{ flex: "1 1  100%" }}
                  variant="h5"
                  id="tableTitle"
                >
                  Transctions
                </Typography>

                {filter === "Custom" ? (
                  <DatePicker
                    label="Basic date picker"
                    value={customFilter}
                    onChange={(newValue) => handleCustomFilter(newValue)}
                  />
                ) : (
                  ""
                )}

                <IconButton sx={{ ml: 5 }}>
                  <FilterListIcon onClick={handleClick} />
                  <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                  >
                    <Container sx={{ p: 2 }}>
                      <Stack sx={{ cursor: "pointer" }}>
                        <Typography
                          variant="h6"
                          sx={{ p: 1 }}
                          onClick={() => handleFilter("today")}
                        >
                          Today
                        </Typography>
                        <Divider />
                        <Typography
                          variant="h6"
                          sx={{ p: 1 }}
                          onClick={() => handleFilter("Tomorrow")}
                        >
                          Tomorrow
                        </Typography>
                        <Divider />
                        <Typography
                          variant="h6"
                          sx={{ p: 1 }}
                          onClick={() => handleFilter("This Month")}
                        >
                          This Month
                        </Typography>
                        <Divider />
                        <Typography
                          variant="h6"
                          sx={{ p: 1 }}
                          onClick={() => handleFilter("Custom")}
                        >
                          Custom
                        </Typography>
                      </Stack>
                    </Container>
                  </Popover>
                </IconButton>
              </Toolbar>
              <TableContainer>
                <Table
                  sx={{ minWidth: 750 }}
                  aria-labelledby="tableTitle"
                  size="medium"
                >
                  <EnhancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {visibleRows.map((row, index) => {
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <TableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={row.id}
                          sx={{ cursor: "pointer" }}
                        >
                          <TableCell
                            component="th"
                            id={labelId}
                            scope="row"
                            padding="none"
                          >
                            {row.dateofTransction}
                          </TableCell>
                          <TableCell align="right">{row.roomNo}</TableCell>
                          <TableCell align="left">{row.against}</TableCell>
                          <TableCell align="left">{row.attendant}</TableCell>
                          <TableCell align="left">{row.orderId}</TableCell>
                          <TableCell align="left">{row.mode}</TableCell>
                          <TableCell align="right">{row.paymentId}</TableCell>
                          <TableCell align="right">{row.txnTime}</TableCell>
                          <TableCell align="right">
                            {row.discountCoupon}
                          </TableCell>
                          <TableCell align="right">
                            {row.discountPercentage}
                          </TableCell>
                          <TableCell align="right">{row.discount}</TableCell>
                          <TableCell align="right">{row.amount}</TableCell>
                          <TableCell align="right">{row.finalAmount}</TableCell>
                          <TableCell align="right">{row.status}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Box>
        </MainCard>
      )}
    </>
  );
}
