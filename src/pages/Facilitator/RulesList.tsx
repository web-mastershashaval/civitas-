import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Plus, Edit, ToggleLeft, ToggleRight, Loader2, Shield } from "lucide-react";
import api from "../../services/api";

export function RulesList() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const response = await api.get('/rules/');
                setRules(response.data.results || response.data);
            } catch (error) {
                console.error("Failed to fetch rules", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRules();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#e6e6e6]">Community Rules</h1>
                    <p className="text-[#9aa0a6] mt-2">Configure how your community handles different situations</p>
                </div>
                <Link to="/facilitator/rules/create">
                    <Button className="bg-[#4f8cff] text-white hover:bg-[#3b76e0] rounded-none border-none font-bold uppercase tracking-widest text-xs">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Rule
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                {rules.length === 0 && (
                    <div className="p-12 text-center border border-dashed border-[#2a2f3a] bg-[#161a20]/30 min-h-[300px] flex flex-col items-center justify-center">
                        <Shield className="w-12 h-12 mb-4 text-[#9aa0a6]/20" />
                        <p className="text-[#9aa0a6] uppercase font-black tracking-widest text-xs">No active rules defined.</p>
                        <p className="text-[#9aa0a6] text-xs mt-2 italic">Define community or local rules to manage your community.</p>
                    </div>
                )}

                {rules.map((rule) => (
                    <Card key={rule.id} className={`bg-[#161a20] border-[#2a2f3a] rounded-none ${rule.active ? "" : "opacity-60"}`}>
                        <CardHeader className="pb-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-lg font-bold text-[#e6e6e6] leading-tight">{rule.description || "Custom Rule"}</h3>

                                    {rule.is_system ? (
                                        <div className="text-[10px] font-black text-[#4f8cff] uppercase tracking-[0.2em]">System</div>
                                    ) : (
                                        <div className="text-[10px] font-black text-[#9aa0a6] uppercase tracking-[0.2em]">Community Rule</div>
                                    )}

                                    <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] opacity-60">
                                        {rule.code} • {rule.scope_type}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-4">
                                    <div className="flex items-center gap-2">
                                        {rule.active ? (
                                            <ToggleRight className="w-6 h-6 text-[#4f8cff] cursor-pointer" />
                                        ) : (
                                            <ToggleLeft className="w-6 h-6 text-[#9aa0a6]/40 cursor-pointer" />
                                        )}
                                    </div>
                                    {!rule.is_system && (
                                        <Link to={`/facilitator/rules/${rule.id}/edit`}>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-[#2a2f3a] text-[#9aa0a6] hover:text-[#4f8cff] hover:border-[#4f8cff]/30">
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
