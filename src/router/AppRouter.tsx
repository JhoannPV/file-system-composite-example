import { Navigate, Route, Routes } from "react-router"
import { CompositeExample } from "../composite-example"

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="*" element={<Navigate to='composite-example' />} />
            <Route path="/" element={<Navigate to='composite-example' />} />
            <Route path="/composite-example" element={<CompositeExample />} />
        </Routes>
    )
}