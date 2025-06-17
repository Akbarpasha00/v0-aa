"use client"

import { Hono } from "hono"
import { cors } from "hono/cors"
import { serveStatic } from "hono/cloudflare-workers"

type Bindings = {
  PLACEMENT_DATA: KVNamespace
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use("*", cors())

// Serve static files
app.use("/static/*", serveStatic({ root: "./" }))

// API Routes
app.get("/api/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Placement CMS API",
  })
})

// Students API
app.get("/api/students", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM students ORDER BY created_at DESC").all()

    return c.json({
      success: true,
      data: results,
      count: results.length,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to fetch students",
      },
      500,
    )
  }
})

app.post("/api/students", async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, phone, course, year } = body

    const result = await c.env.DB.prepare(
      "INSERT INTO students (name, email, phone, course, year, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(name, email, phone, course, year, new Date().toISOString())
      .run()

    return c.json({
      success: true,
      message: "Student added successfully",
      id: result.meta.last_row_id,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to add student",
      },
      500,
    )
  }
})

// Companies API
app.get("/api/companies", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM companies ORDER BY created_at DESC").all()

    return c.json({
      success: true,
      data: results,
      count: results.length,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to fetch companies",
      },
      500,
    )
  }
})

app.post("/api/companies", async (c) => {
  try {
    const body = await c.req.json()
    const { name, industry, location, contact_email, requirements } = body

    const result = await c.env.DB.prepare(
      "INSERT INTO companies (name, industry, location, contact_email, requirements, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(name, industry, location, contact_email, requirements, new Date().toISOString())
      .run()

    return c.json({
      success: true,
      message: "Company added successfully",
      id: result.meta.last_row_id,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to add company",
      },
      500,
    )
  }
})

// Placements API
app.get("/api/placements", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT p.*, s.name as student_name, c.name as company_name 
      FROM placements p 
      JOIN students s ON p.student_id = s.id 
      JOIN companies c ON p.company_id = c.id 
      ORDER BY p.created_at DESC
    `).all()

    return c.json({
      success: true,
      data: results,
      count: results.length,
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to fetch placements",
      },
      500,
    )
  }
})

// Dashboard stats
app.get("/api/stats", async (c) => {
  try {
    const [studentsCount, companiesCount, placementsCount] = await Promise.all([
      c.env.DB.prepare("SELECT COUNT(*) as count FROM students").first(),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM companies").first(),
      c.env.DB.prepare("SELECT COUNT(*) as count FROM placements").first(),
    ])

    return c.json({
      success: true,
      data: {
        students: studentsCount?.count || 0,
        companies: companiesCount?.count || 0,
        placements: placementsCount?.count || 0,
        success_rate: placementsCount?.count > 0 ? Math.round((placementsCount.count / studentsCount?.count) * 100) : 0,
      },
    })
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to fetch stats",
      },
      500,
    )
  }
})

// Main app route - serve the React app
app.get("*", (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Placement CMS - Cloudflare Workers</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
</head>
<body>
    <div id="root"></div>
    <script>
        const { useState, useEffect } = React;
        
        function App() {
            const [stats, setStats] = useState({
                students: 0,
                companies: 0,
                placements: 0,
                success_rate: 0
            });
            const [loading, setLoading] = useState(true);
            
            useEffect(() => {
                fetch('/api/stats')
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setStats(data.data);
                        }
                        setLoading(false);
                    })
                    .catch(() => setLoading(false));
            }, []);
            
            return React.createElement('div', {
                className: 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'
            }, [
                React.createElement('div', {
                    key: 'container',
                    className: 'max-w-6xl mx-auto'
                }, [
                    React.createElement('div', {
                        key: 'header',
                        className: 'bg-white rounded-lg shadow-xl p-8 mb-8'
                    }, [
                        React.createElement('div', {
                            key: 'title-section',
                            className: 'text-center mb-8'
                        }, [
                            React.createElement('h1', {
                                key: 'title',
                                className: 'text-5xl font-bold text-blue-600 mb-4'
                            }, '🎓 Placement CMS'),
                            React.createElement('p', {
                                key: 'subtitle',
                                className: 'text-2xl text-gray-700 mb-2'
                            }, 'College Placement Management System'),
                            React.createElement('div', {
                                key: 'status',
                                className: 'bg-orange-100 inline-block px-6 py-2 rounded-full'
                            }, React.createElement('p', {
                                className: 'text-orange-800 font-semibold'
                            }, '⚡ Powered by Cloudflare Workers'))
                        ]),
                        
                        React.createElement('div', {
                            key: 'stats-grid',
                            className: 'grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'
                        }, [
                            React.createElement('div', {
                                key: 'students-card',
                                className: 'bg-blue-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow'
                            }, [
                                React.createElement('div', {
                                    key: 'icon',
                                    className: 'text-4xl mb-3'
                                }, '👥'),
                                React.createElement('h3', {
                                    key: 'title',
                                    className: 'text-xl font-bold text-blue-800 mb-2'
                                }, 'Students'),
                                React.createElement('p', {
                                    key: 'desc',
                                    className: 'text-blue-600'
                                }, 'Registered students'),
                                React.createElement('div', {
                                    key: 'count',
                                    className: 'mt-3 text-2xl font-bold text-blue-700'
                                }, loading ? '...' : stats.students.toLocaleString())
                            ]),
                            
                            React.createElement('div', {
                                key: 'companies-card',
                                className: 'bg-green-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow'
                            }, [
                                React.createElement('div', {
                                    key: 'icon',
                                    className: 'text-4xl mb-3'
                                }, '🏢'),
                                React.createElement('h3', {
                                    key: 'title',
                                    className: 'text-xl font-bold text-green-800 mb-2'
                                }, 'Companies'),
                                React.createElement('p', {
                                    key: 'desc',
                                    className: 'text-green-600'
                                }, 'Partner companies'),
                                React.createElement('div', {
                                    key: 'count',
                                    className: 'mt-3 text-2xl font-bold text-green-700'
                                }, loading ? '...' : stats.companies.toLocaleString())
                            ]),
                            
                            React.createElement('div', {
                                key: 'placements-card',
                                className: 'bg-purple-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow'
                            }, [
                                React.createElement('div', {
                                    key: 'icon',
                                    className: 'text-4xl mb-3'
                                }, '✅'),
                                React.createElement('h3', {
                                    key: 'title',
                                    className: 'text-xl font-bold text-purple-800 mb-2'
                                }, 'Placements'),
                                React.createElement('p', {
                                    key: 'desc',
                                    className: 'text-purple-600'
                                }, 'Successful placements'),
                                React.createElement('div', {
                                    key: 'count',
                                    className: 'mt-3 text-2xl font-bold text-purple-700'
                                }, loading ? '...' : stats.placements.toLocaleString())
                            ]),
                            
                            React.createElement('div', {
                                key: 'success-card',
                                className: 'bg-orange-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow'
                            }, [
                                React.createElement('div', {
                                    key: 'icon',
                                    className: 'text-4xl mb-3'
                                }, '📊'),
                                React.createElement('h3', {
                                    key: 'title',
                                    className: 'text-xl font-bold text-orange-800 mb-2'
                                }, 'Success Rate'),
                                React.createElement('p', {
                                    key: 'desc',
                                    className: 'text-orange-600'
                                }, 'Placement success'),
                                React.createElement('div', {
                                    key: 'count',
                                    className: 'mt-3 text-2xl font-bold text-orange-700'
                                }, loading ? '...' : stats.success_rate + '%')
                            ])
                        ]),
                        
                        React.createElement('div', {
                            key: 'features',
                            className: 'bg-gray-50 p-6 rounded-lg mb-6'
                        }, [
                            React.createElement('h3', {
                                key: 'title',
                                className: 'text-xl font-bold text-gray-800 mb-4'
                            }, '⚡ Cloudflare Features'),
                            React.createElement('div', {
                                key: 'features-grid',
                                className: 'grid md:grid-cols-2 gap-4'
                            }, [
                                React.createElement('div', {
                                    key: 'f1',
                                    className: 'flex items-center space-x-3'
                                }, [
                                    React.createElement('span', {
                                        key: 'check',
                                        className: 'text-green-500 text-xl'
                                    }, '✓'),
                                    React.createElement('span', {key: 'text'}, 'Global Edge Network')
                                ]),
                                React.createElement('div', {
                                    key: 'f2',
                                    className: 'flex items-center space-x-3'
                                }, [
                                    React.createElement('span', {
                                        key: 'check',
                                        className: 'text-green-500 text-xl'
                                    }, '✓'),
                                    React.createElement('span', {key: 'text'}, 'D1 Database Integration')
                                ]),
                                React.createElement('div', {
                                    key: 'f3',
                                    className: 'flex items-center space-x-3'
                                }, [
                                    React.createElement('span', {
                                        key: 'check',
                                        className: 'text-green-500 text-xl'
                                    }, '✓'),
                                    React.createElement('span', {key: 'text'}, 'KV Storage for Caching')
                                ]),
                                React.createElement('div', {
                                    key: 'f4',
                                    className: 'flex items-center space-x-3'
                                }, [
                                    React.createElement('span', {
                                        key: 'check',
                                        className: 'text-green-500 text-xl'
                                    }, '✓'),
                                    React.createElement('span', {key: 'text'}, 'Serverless Architecture')
                                ]),
                                React.createElement('div', {
                                    key: 'f5',
                                    className: 'flex items-center space-x-3'
                                }, [
                                    React.createElement('span', {
                                        key: 'check',
                                        className: 'text-green-500 text-xl'
                                    }, '✓'),
                                    React.createElement('span', {key: 'text'}, 'Auto-scaling & DDoS Protection')
                                ]),
                                React.createElement('div', {
                                    key: 'f6',
                                    className: 'flex items-center space-x-3'
                                }, [
                                    React.createElement('span', {
                                        key: 'check',
                                        className: 'text-green-500 text-xl'
                                    }, '✓'),
                                    React.createElement('span', {key: 'text'}, 'Zero Cold Start')
                                ])
                            ])
                        ]),
                        
                        React.createElement('div', {
                            key: 'deployment-info',
                            className: 'bg-orange-50 p-6 rounded-lg'
                        }, [
                            React.createElement('h3', {
                                key: 'title',
                                className: 'text-lg font-bold text-orange-800 mb-3'
                            }, '🌐 Deployment Details'),
                            React.createElement('div', {
                                key: 'details-grid',
                                className: 'grid md:grid-cols-3 gap-4 text-sm'
                            }, [
                                React.createElement('div', {key: 'd1'}, [
                                    React.createElement('strong', {key: 'label'}, 'Platform: '),
                                    'Cloudflare Workers'
                                ]),
                                React.createElement('div', {key: 'd2'}, [
                                    React.createElement('strong', {key: 'label'}, 'Edge Locations: '),
                                    '300+ Global'
                                ]),
                                React.createElement('div', {key: 'd3'}, [
                                    React.createElement('strong', {key: 'label'}, 'Status: '),
                                    React.createElement('span', {
                                        key: 'status',
                                        className: 'text-green-600 font-semibold'
                                    }, 'Live')
                                ]),
                                React.createElement('div', {key: 'd4'}, [
                                    React.createElement('strong', {key: 'label'}, 'Response Time: '),
                                    '< 10ms'
                                ]),
                                React.createElement('div', {key: 'd5'}, [
                                    React.createElement('strong', {key: 'label'}, 'Uptime: '),
                                    '99.99%'
                                ]),
                                React.createElement('div', {key: 'd6'}, [
                                    React.createElement('strong', {key: 'label'}, 'SSL: '),
                                    'Universal SSL'
                                ])
                            ])
                        ])
                    ])
                ])
            ]);
        }
        
        ReactDOM.render(React.createElement(App), document.getElementById('root'));
    </script>
</body>
</html>
  `)
})

export default app
