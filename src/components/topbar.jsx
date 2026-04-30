import { createSignal } from "solid-js";

function TopBar() {
    const [user, setUser] = createSignal({
        name: "Gagan",
        email: "gagan@mail.com"
    });



    return (
        <div class="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-black/30 backdrop-blur-xl">

            {/* LEFT */}
            <div class="flex items-center gap-3">

                {/* BRAND */}
                <a href="/" class="flex items-center gap-3 group">
                    <div class="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 flex items-center justify-center font-black text-black shadow-[0_0_30px_rgba(34,211,238,.35)] group-hover:scale-105 transition">
                        <img src="./dist/assets/eleczen_512.png" alt="ElecZen" />
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

                    {/* ACTIVE */}
                    <a
                        href="/"
                        class="relative text-sm text-white font-medium pb-1
               after:absolute after:left-0 after:bottom-0
               after:h-[2px] after:w-full
               after:rounded-full
               after:bg-gradient-to-r after:from-cyan-400 after:to-emerald-400"
                    >
                        Home
                    </a>

                    {/* NORMAL */}
                    <a
                        href="/tools"
                        class="relative text-sm text-zinc-400 hover:text-white transition pb-1
               after:absolute after:left-0 after:bottom-0
               after:h-[2px] after:w-0
               after:rounded-full
               after:bg-gradient-to-r after:from-cyan-400 after:to-emerald-400
               after:transition-all after:duration-300
               hover:after:w-full"
                    >
                        Tools
                    </a>

                    <a
                        href="/blogs"
                        class="relative text-sm text-zinc-400 hover:text-white transition pb-1
               after:absolute after:left-0 after:bottom-0
               after:h-[2px] after:w-0
               after:rounded-full
               after:bg-gradient-to-r after:from-cyan-400 after:to-emerald-400
               after:transition-all after:duration-300
               hover:after:w-full"
                    >
                        Blogs
                    </a>

                </nav>

                {/* AUTH */}
                <Show
                    when={user()}
                    fallback={
                        <div class="flex items-center gap-2">
                            <a
                                href="/login"
                                class="px-4 py-2 rounded-xl text-sm text-zinc-300 hover:text-white transition"
                            >
                                Login
                            </a>

                            <a
                                href="/signup"
                                class="px-4 py-2 rounded-xl text-sm font-medium text-black bg-gradient-to-r from-cyan-400 to-emerald-400 hover:scale-105 transition"
                            >
                                Sign Up
                            </a>
                        </div>
                    }
                >
                    <a
                        href="/account"
                        class="flex items-center gap-3 p-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition"
                    >
                        <div class="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-black font-bold">
                            {user()?.name?.charAt(0) || "U"}
                        </div>
                    </a>
                </Show>

            </div>
        </div>
    );
}

export default TopBar;