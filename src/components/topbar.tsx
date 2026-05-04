import { createSignal, Show, onCleanup, onMount } from "solid-js";
import { A, useNavigate } from "@solidjs/router";
import { user, loadSession, logoutRequest } from '../utils/auth';
import {
    settings,
    setOption,
    loadDemo,
    loadSavedProject,
    saveProject,
    clearAll,
    loadProject,
} from '../utils/simulation/index';

function TopBar() {
    let importInput;
    const [activeMenu, setActiveMenu] = createSignal(null);
    const navigate = useNavigate();

    const closeMenu = () => setActiveMenu(null);
    const toggleMenu = (menu, e) => {
        e.stopPropagation();
        setActiveMenu(activeMenu() === menu ? null : menu);
    };

    const downloadText = (filename, text, type = "text/plain") => {
        const url = URL.createObjectURL(new Blob([text], { type }));
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importProjectFile = async (file) => {
        if (!file) return;
        const text = await file.text();
        loadProject(text);
        importInput.value = "";
        closeMenu();
    };

    onMount(async () => {
        await loadSession();
        window.addEventListener("click", closeMenu);
    });

    onCleanup(() => {
        window.removeEventListener("click", closeMenu);
    });

    const handleLogout = async () => {
        await logoutRequest();
        navigate("/");
    };

    const activeUser = user;



    return (
        <div class="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/30 backdrop-blur-xl">

            {/* LEFT */}
            <div class="flex items-center gap-3">

                {/* BRAND */}
                <a href="/" class="flex items-center gap-3 group">
                    <div class="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 flex items-center justify-center font-black text-black shadow-[0_0_30px_rgba(34,211,238,.35)] group-hover:scale-105 transition">
                        <img src="https://buqzumrtrksoymzaddvq.supabase.co/storage/v1/object/sign/assets/eleczen_512.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYmIzOTViOC0wZTA2LTQ3YTctOTkyMi0xMDExY2U0MThlZjciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvZWxlY3plbl81MTIucG5nIiwiaWF0IjoxNzc3NTU5NjEwLCJleHAiOjE4MDkwOTU2MTB9.sq0x0spanhUvY8AO4EVkBUEwNhOLVUQG8N6PUTvIAFY" alt="ElecZen" />
                    </div>

                    <div>
                        <h1 class="text-white font-semibold tracking-wide text-lg leading-none">
                            ElecZen
                        </h1>
                        <p class="text-xs text-zinc-500 mt-1">
                            Smart Circuit Playground
                        </p>
                    </div>
                </a>
            </div>

            {/* RIGHT SIDE */}
            <div class="flex items-center gap-8 ml-auto">

                {/* NAV LINKS */}
                <nav class="hidden lg:flex items-center gap-8">
                    <A
                        href="/"
                        end
                        activeClass="text-white after:w-full"
                        inactiveClass="text-zinc-400 hover:text-white after:w-0"
                        class="relative text-sm font-medium pb-1 transition-all duration-300
                               after:absolute after:left-0 after:bottom-0 after:h-[2px] after:rounded-full
                               after:bg-gradient-to-r after:from-cyan-400 after:to-emerald-400
                               after:transition-all after:duration-300"
                    >
                        Home
                    </A>

                    <A
                        href="/editor"
                        activeClass="text-white after:w-full"
                        inactiveClass="text-zinc-400 hover:text-white after:w-0"
                        class="relative text-sm font-medium pb-1 transition-all duration-300
                               after:absolute after:left-0 after:bottom-0 after:h-[2px] after:rounded-full
                               after:bg-gradient-to-r after:from-cyan-400 after:to-emerald-400
                               after:transition-all after:duration-300"
                    >
                        Workspace
                    </A>

                    <A
                        href="/tools"
                        activeClass="text-white after:w-full"
                        inactiveClass="text-zinc-400 hover:text-white after:w-0"
                        class="relative text-sm font-medium pb-1 transition-all duration-300
                               after:absolute after:left-0 after:bottom-0 after:h-[2px] after:rounded-full
                               after:bg-gradient-to-r after:from-cyan-400 after:to-emerald-400
                               after:transition-all after:duration-300"
                    >
                        Tools
                    </A>

                    <A
                        href="/tools/search"
                        activeClass="text-white after:w-full"
                        inactiveClass="text-zinc-400 hover:text-white after:w-0"
                        class="relative text-sm font-medium pb-1 transition-all duration-300
                               after:absolute after:left-0 after:bottom-0 after:h-[2px] after:rounded-full
                               after:bg-gradient-to-r after:from-cyan-400 after:to-emerald-400
                               after:transition-all after:duration-300"
                    >
                        Community
                    </A>
                </nav>

                {/* AUTH */}
                <Show
                    when={activeUser()}
                    fallback={
                        <div class="flex items-center gap-2">
                            <A
                                href="/login"
                                class="px-4 py-2 rounded-xl text-sm text-zinc-300 hover:text-white transition"
                            >
                                Login
                            </A>

                            <A
                                href="/signup"
                                class="px-4 py-2 rounded-xl text-sm font-medium text-black bg-gradient-to-r from-cyan-400 to-emerald-400 hover:scale-105 transition"
                            >
                                Sign Up
                            </A>
                        </div>
                    }
                >
                    <div class="flex items-center gap-3">
                        <A
                            href="/publish"
                            class="px-4 py-2 rounded-xl text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 transition"
                        >
                            Publish Part
                        </A>
                        <A
                            href="/profile"
                            class="flex items-center gap-3 p-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition"
                        >
                            <div class="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black font-bold">
                                {activeUser()?.name?.charAt(0) || "U"}
                            </div>
                        </A>
                        <button
                            type="button"
                            onClick={handleLogout}
                            class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 transition"
                        >
                            Logout
                        </button>
                    </div>
                </Show>

            </div>
        </div>
    );
}

export default TopBar;