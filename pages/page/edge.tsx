export const getServerSideProps = async (context: any) => {
  console.log(context.req);
  return {
    props: {
      debug: JSON.stringify({
        headers: context.req.headers,
        url: context.req.url,
      }),
    },
  };
};

export default function handler(props: any) {
  return <div dangerouslySetInnerHTML={{ __html: `---${props.debug}---` }} />;
}

export const config = {
  runtime: "experimental-edge",
};
