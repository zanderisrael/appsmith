use wasm_bindgen::prelude::*;
use almond::parse_program;
use nom::Err;

#[wasm_bindgen]
pub fn parse(program_str: &str) -> Result<String, String> {
    match parse_program(program_str.into()) {
        Err(Err::Error(e)) | Err(Err::Failure(e)) => {
          Err(e.to_string())
        }
        Ok(ast) => Ok(serde_json::to_string_pretty(&ast.1).unwrap()),
        _ => Err(String::from("Error in parsing"))
    }
  }