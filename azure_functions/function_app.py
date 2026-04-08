import azure.functions as func
from process_pdf_function.http_blueprint import bp

app = func.FunctionApp()
app.register_functions(bp)
