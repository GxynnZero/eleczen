import { SessionProvider } from "next-auth/react"

export default function Projects({ children }) {
    const api_Base_url = process.env.API_BASE_URL;
    return (
        <SessionProvider
            basePath={api_Base_url}
            refetchOnWindowFocus={false}
        >
            {children}
        </SessionProvider>
    );
}