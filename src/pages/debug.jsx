import ConsolePanel from "../components/ConsolePanel";

export default function Debug() {
    return (
        <div class="flex h-screen w-screen items-center justify-center">
            <h1 class="text-4xl font-bold">Debug Page</h1>
            <ConsolePanel />
        </div>
    );
}