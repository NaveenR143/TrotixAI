import azure.functions as func

bp = func.Blueprint()


@bp.route(route="default_template")
def default_template(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse("Hello World!")
