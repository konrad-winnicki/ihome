import PropertiesReader from "properties-reader";
import path from "node:path";

const propertiesPath = path.resolve(process.cwd(), 'src/app.properties');
export const properties = PropertiesReader(propertiesPath, undefined, {
  writer: { saveSections: true },
});

export const propertyWriter = (key:string, value:string) => {
 
    properties.set(key, value);
    properties.save(propertiesPath, function (error, _data) {
      if (error) {
        console.error("Error saving properties:", error);
      } else {
        console.log("Properties file updated successfully.");
      }
    });
  } 

