import Timeline from "./Timeline";

type Component = {
  type: string;
  data?: any;
};

type Schema = {
  components?: Component[];
};

export default function Renderer({ schema }: { schema: Schema }) {
  if (!schema?.components) return null;

  return (
    <div className="space-y-4">
      {schema.components.map((c, i) => {
        switch (c.type) {
          case "timeline":
            return <Timeline key={i} data={c.data} />;
          default:
            return (
              <p key={i} className="text-xs text-zinc-600">
                Unknown component: {c.type}
              </p>
            );
        }
      })}
    </div>
  );
}
