import { useEffect } from 'react'

const QRImg = () => {
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || ''

    const androidUrl =
      'https://play.google.com/store/apps/details?id=com.millionmalayaliclub&pcampaignid=web_share'
    const iosUrl = 'https://apps.apple.com/in/app/million-malayali-club/id6758528132'

    if (/android/i.test(userAgent)) {
      window.location.href = androidUrl
    } else if (/iPad|iPhone|iPod/.test(userAgent)) {
      window.location.href = iosUrl
    } else {
      console.log('Device not supported or fallback page')
    }
  }, [])

  return <p>Redirecting to your app store...</p>
}

export default QRImg
