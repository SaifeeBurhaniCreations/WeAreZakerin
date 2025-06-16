import { Spinner as GlueSpinner } from "@/components/ui/spinner"
import { getColor } from '@/src/constants/colors'
const Spinner = ({ size = 'large' }) => {
  return (
    <GlueSpinner size={size} color={getColor("green", 200)} />
  )
}

export default Spinner
