"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, Typography, Grid, CircularProgress } from "@mui/material"

const DashboardContent = () => {
  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    placements: 0,
    avgPackage: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="div">
              Total Students
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <Typography variant="h3" component="div">
                {stats.students}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="div">
              Total Companies
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <Typography variant="h3" component="div">
                {stats.companies}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="div">
              Total Placements
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <Typography variant="h3" component="div">
                {stats.placements}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="div">
              Average Package
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <Typography variant="h3" component="div">
                {stats.avgPackage}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DashboardContent
