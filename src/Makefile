# Makefile for Send Tab URLs

EXT_VER=`./getver.pl`
DIST_FILE=sendtabs-$(EXT_VER).xpi
DIST_DEST=/cygdrive/e/
EXCLUDE=*~ *\.html *\.psp *\.pl *\.idl *\.devel *\.release Makefile

$(DIST_FILE): 
	zip -r $(DIST_FILE) * -x $(EXCLUDE)

copy:
	cp -v $(DIST_FILE) $(DIST_DEST)

clean:
	rm $(DIST_FILE)

# END Makefile
