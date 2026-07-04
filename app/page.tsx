export default function Home() {
  return (
    <main className="main-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-white">CI/CD Pipeline Demo</h1>
        <p className="text-gray-400 mt-2">
          Production-style GitHub Actions platform on Azure Container Apps
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-20">
        {[
          { label: "CI", desc: "Lint · Test · Coverage · Security Scan" },
          { label: "Docker", desc: "Multi-stage build · SHA-tagged · GHCR" },
          { label: "Staging", desc: "Auto-deploy on main merge · Smoke test" },
          { label: "Production", desc: "Manual approval · OIDC · Rollback" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">{item.label}</p>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}

        <div className="text-gray-600 text-sm">
          Environment: {process.env.NEXT_PUBLIC_ENV ?? "local"} · Version:{" "}
          {process.env.NEXT_PUBLIC_VERSION ?? "dev"}
        </div>
      </div>
    </main>
  );
}
