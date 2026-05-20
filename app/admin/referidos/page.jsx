// Reemplaza TODO el bloque return(...) por este:

  if (cargando) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[#e8849a] border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="p-5 xl:p-7 bg-[#fff8f9] min-h-full space-y-5">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-[13px] font-medium text-white ${
          toast.tipo === "error" ? "bg-red-500" : "bg-[#a0435f]"
        }`}>
          <CheckIcon size={15}/>
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif font-bold text-[#2d1a22] text-[24px] xl:text-[26px]">
              Referidos y comisiones
            </h1>
            <div className="w-6 h-6 rounded-full bg-[#fce8ed] flex items-center justify-center">
              <span className="text-[10px] text-[#a0435f] font-bold">ⓘ</span>
            </div>
          </div>
          <p className="text-[12px] text-[#9a6672]">
            Consulta qué códigos fueron usados, cuántas personas llegaron por cada referente y cuánto corresponde pagar.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setModalCalendario(true)}
            className="flex items-center gap-2 bg-white border border-[#f0dde2] rounded-xl px-3 py-2 text-[12px] text-[#2d1a22] shadow-sm hover:border-[#e8849a] transition">
            <CalendarIcon size={13} className="text-[#a0435f]"/>
            {fechaRango}
            <ChevronDownIcon size={11} className="text-[#9a6672]"/>
          </button>
          <button onClick={exportarPDF}
            className="flex items-center gap-1.5 bg-white border border-[#f0dde2] text-[#a0435f] text-[12px] font-semibold px-4 py-2 rounded-xl hover:bg-[#fce8ed] transition shadow-sm">
            <DownloadIcon size={13}/>
            Exportar reporte
          </button>
          <button onClick={() => setModalAniadir(true)}
            className="flex items-center gap-1.5 bg-[#a0435f] hover:bg-[#8a3550] text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-[#a0435f]/20">
            <UserPlusIcon size={13}/>
            + Añadir referente
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon:UsersIcon,       color:"bg-[#fce8ed] text-[#a0435f]", label:"Total referidos registrados", val: referidos.reduce((a,b)=>a+Number(b.registradas||0),0), change:"+18%" },
          { icon:CheckCircleIcon, color:"bg-[#e8f0e0] text-[#5a8a3a]", label:"Referidos que pagaron",       val: referidos.reduce((a,b)=>a+Number(b.pagaron||0),0),     change:"+26%" },
          { icon:DollarSignIcon,  color:"bg-[#fdf3e3] text-[#c9973a]", label:"Comisiones generadas",
            val: `${referidos.reduce((a,b) => a + parseFloat((b.comision||"").replace(/[^0-9.]/g,"")||0), 0).toLocaleString("es-CO")} USD`,
            change: null },
          { icon:CreditCardIcon,  color:"bg-[#e8f0ff] text-[#2a4a7f]", label:"Comisiones pagadas",
            val: `${referidos.filter(r=>r.estado==="Pagado").reduce((a,b) => a + parseFloat((b.comision||"").replace(/[^0-9.]/g,"")||0), 0).toLocaleString("es-CO")} USD`,
            change: null },
          { icon:ClockIcon,       color:"bg-[#fff0f8] text-[#a0435f]", label:"Pendientes por pagar",
            val: `${referidos.filter(r=>r.estado==="Pendiente").reduce((a,b) => a + parseFloat((b.pendiente||"").replace(/[^0-9.]/g,"")||0), 0).toLocaleString("es-CO")} USD`,
            sub: `${referidos.filter(r=>r.estado==="Pendiente").length} pagos pendientes` },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white border border-[#f0dde2] rounded-2xl px-4 py-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={16} strokeWidth={1.6}/>
              </div>
              <p className="text-[10px] text-[#9a6672] leading-snug mb-1">{s.label}</p>
              <p className="font-serif font-bold text-[20px] text-[#2d1a22] leading-none">{s.val}</p>
              {s.change && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[10px] text-[#9a6672]">Este mes</span>
                  <span className="text-[10px] font-bold text-[#5a8a3a] flex items-center gap-0.5">
                    <ArrowUpIcon size={8}/>{s.change}
                  </span>
                  <span className="text-[10px] text-[#9a6672]">vs abril</span>
                </div>
              )}
              {s.sub && <p className="text-[10px] text-[#c9973a] font-semibold mt-1">{s.sub}</p>}
            </div>
          );
        })}
      </div>

      {/* ── TABLA ── */}
      <div className="bg-white border border-[#f0dde2] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#fce8ed] flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-1 bg-[#fff8f9] rounded-xl p-1 border border-[#f0dde2]">
            {[
              { id:"referente",   label:"Vista por referente"   },
              { id:"inscripcion", label:"Vista por inscripción" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-[12px] font-medium transition ${
                  tab === t.id ? "bg-white text-[#a0435f] font-semibold shadow-sm border border-[#f0dde2]" : "text-[#9a6672] hover:text-[#2d1a22]"
                }`}>{t.label}</button>
            ))}
          </div>
          <div className="flex-1 flex items-center gap-2 flex-wrap lg:justify-end">
            <div className="relative">
              <SearchIcon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0909a]"/>
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar referente o código..."
                className="pl-9 pr-4 py-2 border border-[#f0dde2] rounded-xl text-[12px] w-52
                           focus:outline-none focus:ring-2 focus:ring-[#e8849a]/30 focus:border-[#e8849a] bg-[#fff8f9]"/>
            </div>
            <select onChange={e => setFiltroEstado(e.target.value)}
              className="border border-[#f0dde2] rounded-xl px-3 py-2 text-[11px] text-[#2d1a22] bg-white focus:outline-none cursor-pointer">
              <option value="Todos">Todos los estados</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
            </select>
            <button className="flex items-center gap-1.5 border border-[#f0dde2] rounded-xl px-3 py-2 text-[11px] text-[#9a6672] hover:bg-[#fce8ed] transition">
              <FilterIcon size={12}/>Filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#fce8ed]">
                {["Referente","Código","Registradas","Pagaron","Ingresos generados","Comisión generada","Comisión pagada","Pendiente por pagar","Estado","Acciones"].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#9a6672] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#fff0f3]">
              {filtrados.map(r => (
                <tr key={r.id} className="hover:bg-[#fff8f9] transition">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#fce8ed] border border-[#f0b8c4] flex items-center justify-center shrink-0">
                        <span className="text-[#a0435f] text-[12px] font-bold">{r.inicial}</span>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-[#2d1a22]">{r.nombre}</p>
                        <p className="text-[10px] text-[#9a6672]">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-[#a0435f]">{r.codigo}</span>
                      <button onClick={() => copiarCodigo(r.codigo, r.id)} className="text-[#c0a0a8] hover:text-[#a0435f] transition">
                        {copiado === r.id ? <CheckIcon size={11} className="text-[#5a8a3a]"/> : <CopyIcon size={11}/>}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-[#2d1a22] font-medium">{r.registradas}</td>
                  <td className="px-4 py-3.5 text-[12px] text-[#5a8a3a] font-bold">{r.pagaron}</td>
                  <td className="px-4 py-3.5 text-[12px] text-[#2d1a22]">{r.ingresos}</td>
                  <td className="px-4 py-3.5 text-[12px] text-[#2d1a22]">{r.comision}</td>
                  <td className="px-4 py-3.5 text-[12px] text-[#2d1a22]">{r.pagada}</td>
                  <td className="px-4 py-3.5 text-[12px] font-bold text-[#c9973a]">{r.pendiente}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                      r.estado === "Pagado" ? "bg-[#e8f0e0] text-[#5a8a3a]" : "bg-[#fdf3e3] text-[#c9973a]"
                    }`}>
                      {r.estado === "Pendiente" ? "⏱ Pendiente" : "✓ Pagado"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModalVer(r)}
                        className="w-7 h-7 rounded-lg bg-[#fce8ed] hover:bg-[#f0b8c4] flex items-center justify-center transition">
                        <EyeIcon size={12} className="text-[#a0435f]"/>
                      </button>
                      <MenuAcciones
                        referido={r}
                        onVer={() => setModalVer(r)}
                        onEditar={() => setModalEditar(r)}
                        onEliminar={() => setModalEliminar(r)}
                        onMarcarPagado={() => handleMarcarPagado(r.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={10} className="text-center py-10 text-[13px] text-[#9a6672]">No se encontraron resultados.</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#f0dde2] bg-[#fff8f9]">
                <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]" colSpan={2}>Totales (este mes)</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">{totales.registradas}</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#5a8a3a]">{totales.pagaron}</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">
                  ${filtrados.reduce((a,b) => a + parseFloat((b.ingresos||"").replace(/[^0-9.]/g,"")||0), 0).toLocaleString("es-CO")} USD
                </td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">
                  ${filtrados.reduce((a,b) => a + parseFloat((b.comision||"").replace(/[^0-9.]/g,"")||0), 0).toLocaleString("es-CO")} USD
                </td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#2d1a22]">
                  ${filtrados.filter(r=>r.estado==="Pagado").reduce((a,b) => a + parseFloat((b.comision||"").replace(/[^0-9.]/g,"")||0), 0).toLocaleString("es-CO")} USD
                </td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#c9973a]">
                  ${filtrados.filter(r=>r.estado==="Pendiente").reduce((a,b) => a + parseFloat((b.pendiente||"").replace(/[^0-9.]/g,"")||0), 0).toLocaleString("es-CO")} USD
                </td>
                <td colSpan={2}/>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-[#fce8ed] flex items-center justify-between">
          <p className="text-[11px] text-[#9a6672]">Mostrando {filtrados.length} de {referidos.length} referentes</p>
          <div className="flex items-center gap-1">
            {["‹","1","2","3","›"].map((p, i) => (
              <button key={i} className={`w-7 h-7 rounded-lg text-[11px] font-medium transition ${
                p === "1" ? "bg-[#a0435f] text-white" : "text-[#9a6672] hover:bg-[#fce8ed]"
              }`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILA INFERIOR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
          <h2 className="text-[13px] font-bold text-[#2d1a22] mb-4">Distribución de comisiones</h2>
          <DonaComisiones
            datos={donaData.length > 0 ? donaData : [{ nombre:"Sin datos", monto:"$0", valor:1 }]}
            totalComisiones={referidos.reduce((a,b) => a + parseFloat((b.comision||"").replace(/[^0-9.]/g,"")||0), 0)}
          />
        </div>

        <div className="bg-white border border-[#f0dde2] rounded-2xl p-5 shadow-sm">
          <h2 className="text-[13px] font-bold text-[#2d1a22] mb-4">Top códigos utilizados</h2>
          <div className="divide-y divide-[#fff0f3]">
            <div className="grid grid-cols-[1fr_40px_80px_40px] gap-2 pb-2">
              {["Código","Usos","% del total",""].map((h,i) => (
                <p key={i} className="text-[10px] font-bold uppercase text-[#9a6672]">{h}</p>
              ))}
            </div>
            {topCodigos.map((r, i) => {
              const pct = Math.round((Number(r.registradas) / maxRegistradas) * 100);
              const total2 = referidos.reduce((a,b) => a + Number(b.registradas||0), 0);
              const pctTotal = total2 > 0 ? Math.round((Number(r.registradas) / total2) * 100) : 0;
              return (
                <div key={r.id} className="grid grid-cols-[1fr_40px_80px_40px] gap-2 items-center py-2.5">
                  <span className="text-[12px] font-bold text-[#a0435f]">{r.codigo}</span>
                  <span className="text-[12px] text-[#2d1a22] font-medium">{r.registradas}</span>
                  <div className="h-1.5 bg-[#f0dde2] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#a0435f] to-[#e8849a]" style={{ width:`${pct}%` }}/>
                  </div>
                  <span className="text-[11px] text-[#9a6672] font-medium text-right">{pctTotal}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#f0dde2] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#fce8ed] flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-[#2d1a22]">Últimos pagos de comisiones</h2>
            <a href="#" className="text-[11px] text-[#a0435f] font-semibold hover:underline">Ver todos</a>
          </div>
          <div className="px-5">
            <div className="grid grid-cols-[1fr_80px_100px_70px] gap-2 py-2 border-b border-[#fff0f3]">
              {["Referente","Monto","Fecha","Estado"].map((h,i) => (
                <p key={i} className="text-[10px] font-bold uppercase text-[#9a6672]">{h}</p>
              ))}
            </div>
            {referidos.filter(r => r.estado === "Pagado").slice(0,5).map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_100px_70px] gap-2 items-center py-3 border-b border-[#fff0f3] last:border-0">
                <span className="text-[12px] font-medium text-[#2d1a22]">{r.nombre}</span>
                <span className="text-[12px] font-bold text-[#2d1a22]">{r.comision}</span>
                <span className="text-[11px] text-[#9a6672]">—</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-center bg-[#e8f0e0] text-[#5a8a3a]">Pagado</span>
              </div>
            ))}
            {referidos.filter(r => r.estado === "Pagado").length === 0 && (
              <p className="py-6 text-center text-[12px] text-[#9a6672]">Sin pagos aún.</p>
            )}
          </div>
          <div className="px-5 py-3 border-t border-[#fce8ed]">
            <p className="text-[10px] text-[#9a6672] italic">Los pagos se realizan únicamente a referentes con al menos $50 USD acumulados.</p>
          </div>
        </div>
      </div>

      {/* MODALES */}
      {(modalAniadir || modalEditar) && (
        <ModalReferido inicial={modalEditar} onClose={() => { setModalAniadir(false); setModalEditar(null); }} onSave={handleSave}/>
      )}
      {modalVer      && <ModalVer      referido={modalVer}      onClose={() => setModalVer(null)}/>}
      {modalEliminar && <ModalEliminar referido={modalEliminar} onClose={() => setModalEliminar(null)} onConfirm={handleEliminar}/>}
      {modalCalendario && <ModalCalendario onClose={() => setModalCalendario(false)} onSelect={setFechaRango}/>}

    </div>
  );
}