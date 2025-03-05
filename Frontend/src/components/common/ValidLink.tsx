import { useFetchValidLinks } from "../../hooks/useFetchValidLinks";
const ValidLink = () => {
  const { links, loading, error } = useFetchValidLinks();

  if (loading) return <p>Loading links...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold">Valid Streaming Links</h3>
      <ul className="mt-2">
        {links.length > 0 ? (
          links.map((link) => (
            <li key={link.id} className="p-2 border rounded-lg my-2">
              <a
                href={`http://localhost:5000/stream/${link.link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                {link.link}
              </a>{" "}
              (Expires: {new Date(link.expired_at).toLocaleString()})
            </li>
          ))
        ) : (
          <p>No active links</p>
        )}
      </ul>
    </div>
  );
};

export default ValidLink;