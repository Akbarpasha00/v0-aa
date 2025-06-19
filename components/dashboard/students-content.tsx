"use client"

import React, { useState, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Tooltip,
} from "@nextui-org/react"
import { PlusIcon } from "@/components/icons"
import { SearchIcon } from "@/components/icons"
import { VerticalDotsIcon } from "@/components/icons"
import { columns, statusOptions } from "@/utils/data"

export default function StudentsContent() {
  const [filterValue, setFilterValue] = useState("")
  const [selectedStatus, setSelectedStatus] = useState(new Set([]))
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "age",
    direction: "ascending",
  })
  const [page, setPage] = useState(1)

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students")
      const result = await response.json()
      if (result.success) {
        setStudents(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const filteredItems = React.useMemo(() => {
    let filteredStudents = [...students]

    if (filterValue) {
      filteredStudents = filteredStudents.filter((student) =>
        student.name.toLowerCase().includes(filterValue.toLowerCase()),
      )
    }
    if (selectedStatus.size > 0) {
      filteredStudents = filteredStudents.filter((student) => Array.from(selectedStatus).includes(student.status))
    }

    return filteredStudents
  }, [students, filterValue, selectedStatus])

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column]
      const second = b[sortDescriptor.column]
      const cmp = first < second ? -1 : first > second ? 1 : 0

      return sortDescriptor.direction === "descending" ? -cmp : cmp
    })
  }, [filteredItems, sortDescriptor])

  const pages = Math.ceil(filteredItems.length / rowsPerPage)

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return sortedItems.slice(start, end)
  }, [sortedItems, page, rowsPerPage])

  const renderCell = React.useCallback((student, columnKey) => {
    const cellValue = student[columnKey]

    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{cellValue}</p>
            <p className="text-tiny text-default-400 capitalize">{student.email}</p>
          </div>
        )
      case "age":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{cellValue}</p>
          </div>
        )
      case "city":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{cellValue}</p>
          </div>
        )
      case "status":
        return (
          <Chip className="capitalize" color={student.statusColor} size="sm" variant="flat">
            {cellValue}
          </Chip>
        )
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">{/* <EyeIcon /> */}</span>
            </Tooltip>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button isIconOnly size="sm" className="bg-transparent text-default-500 shadow-none">
                  <VerticalDotsIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem>View</DropdownItem>
                <DropdownItem>Edit</DropdownItem>
                <DropdownItem className="text-danger">Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        )
      default:
        return cellValue
    }
  }, [])

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value))
    setPage(1)
  }, [])

  const onSearchChange = React.useCallback((value) => {
    if (value === "") {
      setFilterValue("")
    } else {
      setFilterValue(value)
    }
    setPage(1)
  }, [])

  const onClear = React.useCallback(() => {
    setFilterValue("")
    setPage(1)
  }, [])

  const onStatusChange = React.useCallback((value) => {
    setSelectedStatus(new Set(value))
    setPage(1)
  }, [])

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<SearchIcon className="text-default-300" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  disableRipple
                  className="bg-transparent border-default-200 border rounded-lg"
                  variant="bordered"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={selectedStatus}
                onSelectionChange={onStatusChange}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.value} className="capitalize">
                    {status.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button color="primary" endContent={<PlusIcon />}>
              Add new
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {students.length} students</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent border-none outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    )
  }, [filterValue, selectedStatus, onClear, onSearchChange, onStatusChange, onRowsPerPageChange, students.length])

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">{`${page} - ${pages} of ${students.length} pages`}</span>
        <div className="flex gap-2">
          <Button isDisabled={page === 1} onClick={() => setPage(page - 1)} size="sm" variant="flat">
            Previous
          </Button>
          <Button isDisabled={page === pages} onClick={() => setPage(page + 1)} size="sm" variant="flat">
            Next
          </Button>
        </div>
      </div>
    )
  }, [students.length, page, pages])

  const headerColumns = columns

  return (
    <Table
      aria-label="Example table with custom cells"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="bottom"
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn key={column.uid} align={column.align} allowsSorting={column.sortable}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={items} loadingState={loading ? "loading" : "idle"}>
        {(item) => (
          <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}</TableRow>
        )}
      </TableBody>
    </Table>
  )
}
