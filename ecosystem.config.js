module.exports = {
  apps: [
    {
      name: "placement-cms",
      script: "npm",
      args: "start",
      cwd: "/home/ec2-user/placement-cms",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      log_file: "/var/log/placement-cms/combined.log",
      out_file: "/var/log/placement-cms/out.log",
      error_file: "/var/log/placement-cms/error.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      merge_logs: true,
      max_memory_restart: "1G",
      node_args: "--max_old_space_size=1024",
    },
  ],
}
