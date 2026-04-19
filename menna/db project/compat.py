"""
compat.py — Compatibility wrapper for Starlette's TemplateResponse API.
Starlette >= 1.0 changed the signature. This lets us use the old-style calls.
"""
from starlette.templating import Jinja2Templates as _BaseTemplates


class Jinja2Templates(_BaseTemplates):
    def TemplateResponse(self, *args, **kwargs):
        # Old API: TemplateResponse("name.html", {"request": request, ...})
        # New API: TemplateResponse(request, "name.html", {...})
        if args and isinstance(args[0], str):
            name = args[0]
            context = args[1] if len(args) > 1 else {}
            request = context.pop("request", None)
            return super().TemplateResponse(request, name, context, **kwargs)
        return super().TemplateResponse(*args, **kwargs)
