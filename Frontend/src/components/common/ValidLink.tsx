import { useFetchValidLinks } from "../../hooks/useFetchValidLinks";
import { ValidLinkProps } from "../../services/interface";

const ValidLink: React.FC<ValidLinkProps> = ({ billboardName }) => {
  // Passing billboardName to the hook to filter links for specific billboard
  const { links, loading, error } = useFetchValidLinks(billboardName);

  if (loading) return <p>Loading links...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h3 className="text-lg font-semibold">
        Valid Streaming Links for Billboard {billboardName}
      </h3>
      <ul className="mt-2">
        {links.length > 0 ? (
          links.map((link) => (
            <li key={link.id} className="p-2 border rounded-lg my-2">
              <a
                href={`http://localhost:3000/api/streaming/${link.link}`}
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
          <p>No active links for Billboard {billboardName}</p>
        )}
      </ul>
    </div>
  );
};

export default ValidLink;
