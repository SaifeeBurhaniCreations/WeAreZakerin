import { Spinner as GlueSpinner } from "@/components/ui/spinner"
import { getColor } from '@/src/constants/colors'
const Spinner = () => {
  return (
    <GlueSpinner size="large" color={getColor("green", 200)} />
  )
}

export default Spinner
