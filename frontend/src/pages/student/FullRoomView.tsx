import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function FullRoomView() {
  const { id } = useParams()
  const [accommodation, setAccommodation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedImage, setSelectedImage] = useState(0)

  const room = accommodation?.rooms?.[0]

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`http://localhost:3333/accommodations/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load accommodation')
        }
        console.log('API response:', data)
        setAccommodation(data.data)
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAccommodation()
    }
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!accommodation) return <div>No accommodation found</div>

  return (
    <div>
      <h1>{accommodation.accommodationName}</h1>
      <p>{accommodation.accommodationLocation}</p>
      <p>{accommodation.accommodationType}</p>
      <p>Capacity: {accommodation.accommodationCapacity}</p>
      <p>Restriction: {accommodation.tenantRestriction}</p>
      <p>{accommodation.accommodationSize} m²</p>
      
      <div>
        {accommodation.images?.map((img: any, index: number) => (
            <img
            key={index}
            src={img.file?.filePath}
            alt="thumb"
            style={{ width: 80, cursor: 'pointer', margin: 5 }}
            onClick={() => setSelectedImage(index)}
            />
        ))}
      </div>

      <div>
        <h3>Tags</h3>
        {accommodation.tags?.map((tag: any, index: number) => (
            <span key={tag.id || index} style={{ marginRight: '8px' }}>
            {tag.tagDetail || tag.tag_detail}
            </span>
        ))}
      </div>

      {room && (
        <div>
            <h3>Room Details</h3>

            <p>₱{room.roomRent} / month</p>
            <p>{room.roomStayType === 'non_transient' ? 'Non-Transient' : 'Transient'}</p>
            <p>{room.roomType}</p>
            <p>Capacity: {room.roomCapacity}</p>
            <p>Availability: {room.roomAvailability}</p>
        </div>
      )}

      <div>
        <h3>Inclusions</h3>

        {accommodation.tags?.map((tag: any) => (
            <div key={tag.id}>✔ {tag.tagDetail || tag.tag_detail}</div>
        ))}
      </div>
      
      <p>
        Allowed Tenants: {room?.tenantRestriction}
      </p>
    </div>
  )
}