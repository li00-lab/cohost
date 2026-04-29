import Timeline from "./Timeline";

export default function Renderer({ schema }: any) {
  if (!schema || !schema.components) return null;

  return (
    <div className="space-y-4">
      {schema.components.map((c: any, i: number) => {
        switch (c.type) {
          case "timeline":
            return <Timeline key={i} data={c.data} />;
          default:
            return <div key={i}>Unknown component</div>;
        }
      })}
    </div>
  );
}
