import { BrowserRouter } from "react-router"
import { AppRouter } from "./router"

function CompositeApp() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}

export default CompositeApp
