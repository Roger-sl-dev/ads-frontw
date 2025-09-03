import { useState, useEffect } from "react";

/**
 * Mini sistema de rotas com design completo
 * - Home: captura ID do anúncio
 * - Formulário: coleta dados de conversão e confirma com alert
 */

function Home({ navigate }) {
  const [id, setId] = useState(localStorage.getItem("adId") || "");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!id.trim()) {
      setError("Informe um ID válido.");
      return;
    }
    localStorage.setItem("adId", id.trim());
    navigate("/form");
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-emerald-100 to-emerald-50 text-neutral-900 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-neutral-200">
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-8">Bem-vindo 👋</h1>

        <label htmlFor="adId" className="block text-sm font-medium mb-2">
          Informe o ID do Anúncio:
        </label>

        <div className="flex items-center gap-3">
          <input
            id="adId"
            type="text"
            placeholder="Ex: 12345"
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            onClick={handleSubmit}
            disabled={!id.trim()}
            className={`rounded-lg px-5 py-2 font-medium shadow transition ${
              id.trim() ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
            }`}
          >
            Próximo
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

function Formulario({ navigate }) {
  const [form, setForm] = useState({
    adId: localStorage.getItem("adId") || "",
    conversion_action: "",
    conversion_time: "",
    value: "",
    currency_code: "",
    order_id: "",
    nome: "",
    email: "",
    cidade: "",
    pais: ""
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Preenche a hora atual automaticamente
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      conversion_time: new Date().toISOString()
    }));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(false);
    setError("");

    // Mostrar alerta de confirmação
    const formDataString = Object.entries(form)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    const confirmSend = window.confirm(`Confirme os dados:\n\n${formDataString}`);
    if (!confirmSend) return;

    try {
      const res = await fetch("https://sua-api.com/conversions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Erro na API");
      setSubmitted(true);
    } catch (err) {
      setError("Falha ao enviar formulário");
    }
  }

  // Função para avançar com Enter
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      const formElements = Array.from(e.target.form.elements).filter((el) => el.tagName === "INPUT");
      const index = formElements.indexOf(e.target);
      if (index < formElements.length - 1) formElements[index + 1].focus();
      else handleSubmit(e);
    }
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-emerald-100 to-emerald-50 text-neutral-900 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-lg border border-neutral-200 relative overflow-y-auto max-h-[90vh]">
        <h1 className="text-3xl font-bold text-center text-emerald-700 mb-8">Formulário de Conversão</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries({
            adId: "ID Anúncio",
            conversion_action: "Ação da Conversão",
            conversion_time: "Horário da Conversão",
            value: "Valor",
            currency_code: "Moeda (ex: BRL)",
            order_id: "ID do Pedido",
            nome: "Nome",
            email: "E-mail",
            cidade: "Cidade",
            pais: "País (ex: BR)"
          }).map(([key, placeholder]) => (
            <input
              key={key}
              type={key === "value" ? "number" : key === "email" ? "email" : "text"}
              name={key}
              placeholder={placeholder}
              value={form[key]}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          ))}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-600 px-5 py-2 text-white font-semibold shadow hover:bg-emerald-700 transition"
          >
            Enviar
          </button>

          {submitted && (
            <div className="fixed top-5 right-5 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow">
              ✅ Formulário enviado com sucesso!
            </div>
          )}
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </form>

        <button
          onClick={() => navigate("/")}
          className=" my-5 w-full text-white bottom-6 left-6 text-neutral-800 rounded-lg bg-neutral-100 px-4 py-2 text-sm shadow hover:bg-neutral-200 transition"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  function navigate(to) {
    window.history.pushState({}, "", to);
    setPath(to);
  }

  useEffect(() => {
    window.onpopstate = () => setPath(window.location.pathname);
  }, []);

  if (path === "/form") return <Formulario navigate={navigate} />;
  return <Home navigate={navigate} />;
}
