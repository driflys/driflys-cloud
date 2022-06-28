const inject = (t: string, certificate: any) => {
  const receiverName = certificate.receiver.name;
  const certificateId = certificate.id;
  try {
    const template = JSON.parse(t);
    const objects: any[] = template?.objects;
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if (obj.type === "textbox") {
        switch (obj.text) {
          case "[receiver.name]":
            obj.text = receiverName;
            break;

          case "[certificate.id]":
            obj.text = certificateId;
            break;
        }
      }
    }
    return template;
  } catch (err) {
    throw err;
  }
};

export default inject;
