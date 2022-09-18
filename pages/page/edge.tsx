export const getServerSideProps = async (context: any) => {
  return {
    props: {
      url: context.req.url,
    },
  };
};

export default function handler(props: any) {
  return <div dangerouslySetInnerHTML={{ __html: `---${props.url}---` }} />;
}

export const config = {
  runtime: "experimental-edge",
};
